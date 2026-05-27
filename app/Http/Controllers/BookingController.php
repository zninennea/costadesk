<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Bill;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'room.category']);
        
        // If guest, only see own bookings
        if ($request->user() && $request->user()->role === 'guest') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        // Basic check for availability
        $conflict = Booking::where('room_id', $validated['room_id'])
            ->where('status', '!=', 'cancelled')
            ->where(function($q) use ($validated) {
                $q->whereBetween('check_in', [$validated['check_in'], $validated['check_out']])
                  ->orWhereBetween('check_out', [$validated['check_in'], $validated['check_out']]);
            })->exists();

        if ($conflict) {
            return response()->json(['message' => 'Room is not available for these dates'], 422);
        }

        $room = Room::with('category')->find($validated['room_id']);
        
        // Calculate total price based on base_price * days
        $days = \Carbon\Carbon::parse($validated['check_in'])->diffInDays(\Carbon\Carbon::parse($validated['check_out']));
        if ($days == 0) $days = 1;
        
        $total_price = $room->category->base_price * $days;

        $user = auth('sanctum')->user();
        $booking = Booking::create([
            'user_id' => $user ? $user->id : null,
            'room_id' => $validated['room_id'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'total_price' => $total_price,
            'status' => 'pending',
            'booking_code' => 'BK-' . strtoupper(uniqid()),
            'source_channel' => 'website'
        ]);

        return response()->json($booking, 201);
    }

    public function show(Booking $booking)
    {
        return response()->json($booking->load(['user', 'room.category', 'bill.payments']));
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,checked_in,completed,cancelled,cancellation_requested'
        ]);

        // If checking in, update room status
        if ($validated['status'] === 'checked_in') {
            $booking->room()->update(['status' => 'occupied']);
        }
        
        // If completed or cancelled, free the room
        if (in_array($validated['status'], ['completed', 'cancelled'])) {
            $booking->room()->update(['status' => 'available']);
        }

        $booking->update($validated);
        return response()->json($booking);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $bill = $booking->bill;

        if (!$bill || $bill->status === 'unpaid') {
            $booking->update(['status' => 'cancelled']);
            $booking->room()->update(['status' => 'available']);
            return response()->json(['message' => 'Booking cancelled successfully.']);
        }

        if ($bill->status === 'partial') {
            $booking->update(['status' => 'cancellation_requested']);
            return response()->json(['message' => 'Cancellation requested. Awaiting staff approval for partial refund.']);
        }

        if ($bill->status === 'paid') {
            return response()->json(['message' => 'Per resort policy, cancellations are not allowed for fully paid bookings. You may request rebooking once by contacting front desk.'], 422);
        }

        return response()->json(['message' => 'Cannot cancel booking.'], 422);
    }
}
