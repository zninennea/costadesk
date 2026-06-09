<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index()
    {
        return response()->json(Guest::all());
    }

    public function show(Guest $guest)
    {
        return response()->json($guest);
    }

    public function update(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'first_name' => 'string|max:50',
            'last_name' => 'string|max:50',
            'email' => 'nullable|email|max:100',
            'mobile' => 'string|max:20',
            'city' => 'string|max:100',
            'country' => 'string|max:50',
            'is_blacklisted' => 'boolean',
            'blacklist_reason' => 'nullable|string',
        ]);

        $guest->update($validated);
        return response()->json($guest);
    }

    public function blacklist(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'is_blacklisted' => 'required|boolean',
            'blacklist_reason' => 'nullable|string',
        ]);

        $guest->update([
            'is_blacklisted' => $validated['is_blacklisted'],
            'blacklist_reason' => $validated['is_blacklisted'] ? $validated['blacklist_reason'] : null,
        ]);

        return response()->json([
            'message' => $validated['is_blacklisted'] ? 'Guest blacklisted successfully' : 'Guest whitelisted successfully',
            'guest' => $guest
        ]);
    }

    public function destroy(Guest $guest)
    {
        $guest->delete();
        return response()->json(['message' => 'Guest soft deleted successfully']);
    }
}
