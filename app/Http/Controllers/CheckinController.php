<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Checkin;
use App\Models\Room;
use App\Models\Bill;
use App\Models\Guest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckinController extends Controller
{
    public function walkIn(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'mobile' => 'required|string|max:20',
            'city' => 'required|string|max:100',
            'room_id' => 'required|exists:rooms,id',
            'check_out' => 'required|date|after:today',
            'number_of_adults' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $guest = Guest::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'mobile' => $validated['mobile'],
                'city' => $validated['city']
            ]);

            $room = Room::findOrFail($validated['room_id']);
            
            $checkInDate = now();
            $checkOutDate = Carbon::parse($validated['check_out']);
            $nights = max(1, $checkInDate->startOfDay()->diffInDays($checkOutDate->startOfDay()));
            
            $roomPrice = $room->price ?? $room->category->base_price;
            $totalRoomCharge = $roomPrice * $nights;

            $booking = Booking::create([
                'booking_code' => 'WLK-' . strtoupper(uniqid()),
                'user_id' => $request->user()->id,
                'guest_id' => $guest->id,
                'room_id' => $room->id,
                'source_channel' => 'walk_in',
                'check_in' => $checkInDate->toDateString(),
                'check_out' => $checkOutDate->toDateString(),
                'number_of_adults' => $validated['number_of_adults'],
                'total_price' => $totalRoomCharge,
                'status' => 'checked_in',
                'is_walk_in' => true
            ]);

            $room->update(['status' => 'occupied']);

            $checkin = Checkin::create([
                'booking_id' => $booking->id,
                'guest_id' => $guest->id,
                'room_id' => $room->id,
                'user_id' => $request->user()->id,
                'checkin_datetime' => now(),
                'expected_checkout_datetime' => $checkOutDate->endOfDay(),
                'status' => 'active'
            ]);

            $bill = Bill::create([
                'bill_number' => 'INV-' . date('Ymd') . '-' . rand(1000, 9999),
                'checkin_id' => $checkin->id,
                'booking_id' => $booking->id,
                'guest_id' => $guest->id,
                'created_by_user_id' => $request->user()->id,
                'room_charge' => $totalRoomCharge,
                'subtotal' => $totalRoomCharge,
                'total_amount' => $totalRoomCharge,
                'balance_due' => $totalRoomCharge,
                'status' => 'issued'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Walk-in check-in successful',
                'booking' => $booking,
                'checkin' => $checkin,
                'bill' => $bill
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Walk-in error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process walk-in: ' . $e->getMessage()], 500);
        }
    }

    public function processCheckin(Request $request, $booking_id)
{
    try {
        DB::beginTransaction();

        Log::info('Check-in request for booking ID: ' . $booking_id);

        $booking = Booking::find($booking_id);
        
        if (!$booking) {
            Log::error('Booking not found: ' . $booking_id);
            return response()->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->status === 'checked_in') {
            return response()->json(['error' => 'Guest is already checked in'], 400);
        }

        $room = Room::find($booking->room_id);
        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        // If guest_id is null, create a guest from the user
        if (!$booking->guest_id && $booking->user_id) {
            $user = User::find($booking->user_id);
            if ($user) {
                $guest = Guest::create([
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'mobile' => $user->phone ?? 'N/A',
                    'city' => 'N/A',
                    'country' => 'Philippines'
                ]);
                $booking->guest_id = $guest->id;
                $booking->save();
            }
        }

        // Update room status
        $room->update(['status' => 'occupied']);
        
        // Update booking status
        $booking->update(['status' => 'checked_in']);
        
        // Create check-in record
        $checkin = Checkin::create([
            'booking_id' => $booking->id,
            'guest_id' => $booking->guest_id,
            'room_id' => $room->id,
            'user_id' => $request->user()->id,
            'checkin_datetime' => now(),
            'expected_checkout_datetime' => Carbon::parse($booking->check_out)->endOfDay(),
            'status' => 'active'
        ]);
        
        // Calculate nights and total
        $checkInDate = Carbon::parse($booking->check_in);
        $checkOutDate = Carbon::parse($booking->check_out);
        $nights = max(1, $checkInDate->diffInDays($checkOutDate));
        $roomPrice = $room->price ?? ($room->category->base_price ?? 4800);
        $totalRoomCharge = $roomPrice * $nights;
        
        // CREATE BILL - ALWAYS
        $bill = Bill::create([
            'bill_number' => 'INV-' . date('Ymd') . '-' . str_pad($booking->id, 4, '0', STR_PAD_LEFT),
            'checkin_id' => $checkin->id,
            'booking_id' => $booking->id,
            'guest_id' => $booking->guest_id,
            'created_by_user_id' => $request->user()->id,
            'room_charge' => $totalRoomCharge,
            'subtotal' => $totalRoomCharge,
            'total_amount' => $totalRoomCharge,
            'balance_due' => $totalRoomCharge,
            'status' => 'issued'
        ]);
        
        DB::commit();

        Log::info('Check-in successful for booking: ' . $booking_id . ', Bill ID: ' . $bill->id);

        return response()->json([
            'message' => 'Check-in successful',
            'checkin' => $checkin,
            'bill' => $bill,
            'booking' => $booking
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Check-in error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
        return response()->json(['error' => 'Failed to process check-in: ' . $e->getMessage()], 500);
    }
}
}