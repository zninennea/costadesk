<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomCategory;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        return response()->json(Room::with('category')->get());
    }

    public function categories()
    {
        return response()->json(RoomCategory::all());
    }

    public function show(Room $room)
    {
        return response()->json($room->load('category'));
    }

    public function available(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $start = $request->start_date;
        $end = $request->end_date;

        // Get rooms that are NOT booked for the given date range
        $availableRooms = Room::with('category')
            ->where('status', '!=', 'maintenance')
            ->whereDoesntHave('bookings', function($q) use ($start, $end) {
                $q->whereIn('status', ['pending', 'confirmed', 'checked_in', 'cancellation_requested'])
                  ->where(function($query) use ($start, $end) {
                      $query->where('check_in', '<', $end)
                            ->where('check_out', '>', $start);
                  });
            })
            ->get();

        // Let's also figure out if a whole date range is completely booked out
        // (For the frontend calendar). This might be intensive if we check many days, 
        // but for now, we just return the available rooms for the specific request.
        
        return response()->json([
            'available' => $availableRooms->count() > 0,
            'rooms' => $availableRooms
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|unique:rooms',
            'room_category_id' => 'required|exists:room_categories,id',
            'status' => 'required|in:available,occupied,maintenance',
            'image_url' => 'nullable|string'
        ]);

        $room = Room::create($validated);
        return response()->json($room->load('category'), 201);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_number' => 'string|unique:rooms,room_number,' . $room->id,
            'room_category_id' => 'exists:room_categories,id',
            'status' => 'in:available,occupied,maintenance',
            'image_url' => 'nullable|string'
        ]);

        $room->update($validated);
        return response()->json($room->load('category'));
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(['message' => 'Room deleted successfully']);
    }
}
