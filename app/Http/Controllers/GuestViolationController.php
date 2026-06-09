<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GuestViolation;

class GuestViolationController extends Controller
{
    public function index()
    {
        try {
            $violations = GuestViolation::with('reporter')->orderBy('created_at', 'desc')->get();
            return response()->json($violations);
        } catch (\Exception $e) {
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'booking_id' => 'nullable|exists:bookings,id',
                'guest_name' => 'required|string|max:255',
                'room_number' => 'nullable|string|max:255',
                'violation_type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'action_taken' => 'nullable|string',
            ]);

            $validated['reported_by'] = $request->user()->id;

            $violation = GuestViolation::create($validated);
            return response()->json($violation->load('reporter'), 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create violation'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $violation = GuestViolation::findOrFail($id);
            
            $validated = $request->validate([
                'booking_id' => 'nullable|exists:bookings,id',
                'guest_name' => 'string|max:255',
                'room_number' => 'nullable|string|max:255',
                'violation_type' => 'string|max:255',
                'description' => 'nullable|string',
                'action_taken' => 'nullable|string',
            ]);

            $violation->update($validated);
            return response()->json($violation->load('reporter'));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update violation'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            GuestViolation::destroy($id);
            return response()->json(['message' => 'Violation deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete violation'], 500);
        }
    }
}