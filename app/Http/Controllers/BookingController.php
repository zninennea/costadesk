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
    $query = Booking::with(['user', 'guest', 'room.category']);
    
    // Staff and managers see all bookings
    // Guests see only their own
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

    // Check availability
    $conflict = Booking::where('room_id', $validated['room_id'])
        ->where('status', '!=', 'cancelled')
        ->where(function($q) use ($validated) {
            $q->whereBetween('check_in', [$validated['check_in'], $validated['check_out']])
              ->orWhereBetween('check_out', [$validated['check_in'], $validated['check_out']]);
        })->exists();

    if ($conflict) {
        return response()->json(['message' => 'Room is not available for these dates'], 422);
    }

    $user = auth('sanctum')->user();
    $room = Room::with('category')->find($validated['room_id']);
    
    // Calculate total price
    $days = \Carbon\Carbon::parse($validated['check_in'])->diffInDays(\Carbon\Carbon::parse($validated['check_out']));
    if ($days == 0) $days = 1;
    $total_price = $room->category->base_price * $days;

    // Create or find guest record for this user
    $guest = \App\Models\Guest::firstOrCreate(
        ['email' => $user->email],
        [
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'mobile' => $user->phone ?? 'N/A',
            'city' => 'N/A',
            'country' => 'Philippines'
        ]
    );

    $booking = Booking::create([
        'booking_code' => 'BK-' . strtoupper(uniqid()),
        'user_id' => $user->id,
        'guest_id' => $guest->id,  // ← CRITICAL: Link to guest
        'room_id' => $validated['room_id'],
        'source_channel' => 'website',
        'check_in' => $validated['check_in'],
        'check_out' => $validated['check_out'],
        'number_of_adults' => 1,
        'total_price' => $total_price,
        'status' => 'pending',
        'payment_status' => 'unpaid',
        'is_walk_in' => false
    ]);

    return response()->json($booking, 201);
}

    public function manualReserve(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'mobile' => 'required|string|max:20',
            'city' => 'nullable|string|max:100',
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'number_of_adults' => 'required|integer|min:1',
            'special_requests' => 'nullable|string'
        ]);

        $conflict = Booking::where('room_id', $validated['room_id'])
            ->where('status', '!=', 'cancelled')
            ->where(function($q) use ($validated) {
                $q->whereBetween('check_in', [$validated['check_in'], $validated['check_out']])
                  ->orWhereBetween('check_out', [$validated['check_in'], $validated['check_out']]);
            })->exists();

        if ($conflict) {
            return response()->json(['message' => 'Room is not available for these dates'], 422);
        }

        try {
            \DB::beginTransaction();

            $guest = \App\Models\Guest::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'mobile' => $validated['mobile'],
                'city' => $validated['city'] ?? 'N/A'
            ]);

            $room = Room::with('category')->find($validated['room_id']);
            $days = \Carbon\Carbon::parse($validated['check_in'])->diffInDays(\Carbon\Carbon::parse($validated['check_out']));
            if ($days == 0) $days = 1;
            
            $total_price = ($room->price ?? $room->category->base_price) * $days;

            $booking = Booking::create([
                'booking_code' => 'RSV-' . strtoupper(uniqid()),
                'user_id' => $request->user()->id,
                'guest_id' => $guest->id,
                'room_id' => $room->id,
                'source_channel' => 'phone',
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'number_of_adults' => $validated['number_of_adults'],
                'special_requests' => $validated['special_requests'],
                'total_price' => $total_price,
                'status' => 'confirmed',
                'is_walk_in' => false
            ]);

            \DB::commit();
            return response()->json($booking, 201);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json(['error' => 'Failed to create reservation'], 500);
        }
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
