<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use App\Models\Guest;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::onlyTrashed()->get(),
            'rooms' => Room::onlyTrashed()->with('category')->get(),
            'bookings' => Booking::onlyTrashed()->with(['user', 'guest', 'room'])->get(),
            'guests' => Guest::onlyTrashed()->get(),
        ]);
    }

    public function restore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:user,room,booking,guest',
            'id' => 'required|integer',
        ]);

        $type = $validated['type'];
        $id = $validated['id'];

        switch ($type) {
            case 'user':
                $model = User::onlyTrashed()->findOrFail($id);
                break;
            case 'room':
                $model = Room::onlyTrashed()->findOrFail($id);
                break;
            case 'booking':
                $model = Booking::onlyTrashed()->findOrFail($id);
                break;
            case 'guest':
                $model = Guest::onlyTrashed()->findOrFail($id);
                break;
        }

        $model->restore();

        return response()->json([
            'message' => ucfirst($type) . ' restored successfully'
        ]);
    }
}
