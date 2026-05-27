<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Guest;
use App\Models\Booking;
use App\Models\Checkin;
use App\Models\Room;
use App\Models\Bill;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

            // 1. Create or Find Guest
            $guest = Guest::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'mobile' => $validated['mobile'],
                'city' => $validated['city']
            ]);

            $room = Room::findOrFail($validated['room_id']);
            
            // Calculate nights
            $checkInDate = now();
            $checkOutDate = \Carbon\Carbon::parse($validated['check_out']);
            $nights = $checkInDate->startOfDay()->diffInDays($checkOutDate->startOfDay());
            $nights = $nights > 0 ? $nights : 1;
            
            // Base room price
            $roomPrice = $room->price ?? $room->category->base_price;
            $totalRoomCharge = $roomPrice * $nights;

            // 2. Create Booking
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

            // 3. Update Room Status
            $room->update(['status' => 'occupied']);

            // 4. Create Checkin Record
            $checkin = Checkin::create([
                'booking_id' => $booking->id,
                'guest_id' => $guest->id,
                'room_id' => $room->id,
                'user_id' => $request->user()->id,
                'checkin_datetime' => now(),
                'expected_checkout_datetime' => $checkOutDate->endOfDay(),
                'status' => 'active'
            ]);

            // 5. Generate Bill
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
            return response()->json(['error' => 'Failed to process walk-in'], 500);
        }
    }

    public function processCheckin(Request $request, $booking_id)
    {
        try {
            DB::beginTransaction();

            $booking = Booking::findOrFail($booking_id);
            
            if ($booking->status !== 'confirmed') {
                return response()->json(['error' => 'Booking must be confirmed before check-in'], 400);
            }

            $room = $booking->room;
            $room->update(['status' => 'occupied']);

            $booking->update(['status' => 'checked_in']);

            $checkin = Checkin::create([
                'booking_id' => $booking->id,
                'guest_id' => $booking->guest_id, // assuming guest_id is set
                'room_id' => $room->id,
                'user_id' => $request->user()->id,
                'checkin_datetime' => now(),
                'expected_checkout_datetime' => \Carbon\Carbon::parse($booking->check_out)->endOfDay(),
                'status' => 'active'
            ]);

            // Generate Bill
            $bill = Bill::create([
                'bill_number' => 'INV-' . date('Ymd') . '-' . rand(1000, 9999),
                'checkin_id' => $checkin->id,
                'booking_id' => $booking->id,
                'guest_id' => $booking->guest_id,
                'created_by_user_id' => $request->user()->id,
                'room_charge' => $booking->total_price,
                'subtotal' => $booking->total_price,
                'total_amount' => $booking->total_price,
                'balance_due' => $booking->total_price - ($booking->payment_status === 'paid' ? $booking->total_price : 0),
                'status' => 'issued'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Check-in successful',
                'checkin' => $checkin,
                'bill' => $bill
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Check-in error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process check-in'], 500);
        }
    }
}
