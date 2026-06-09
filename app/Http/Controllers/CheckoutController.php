<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Checkin;
use App\Models\Checkout;
use App\Models\Room;
use App\Models\Bill;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function processCheckout(Request $request, $booking_id)
{
    try {
        DB::beginTransaction();

        $checkin = Checkin::where('booking_id', $booking_id)->where('status', 'active')->first();
        if (!$checkin) {
            return response()->json(['error' => 'No active check-in found for this booking.'], 400);
        }
        
        $booking = $checkin->booking;
        $room = $checkin->room;
        $bill = Bill::where('checkin_id', $checkin->id)->first();

        if (!$bill) {
            return response()->json(['error' => 'No bill found for this check-in.'], 400);
        }

        // Check if payment has been made (paid_amount > 0)
        if ($bill->paid_amount <= 0 && $bill->balance_due > 0) {
            return response()->json([
                'error' => 'Cannot checkout. Guest still has a pending balance of ₱' . number_format($bill->balance_due, 2) . '. Please process payment first.',
                'balance_due' => $bill->balance_due
            ], 400);
        }

        // Create Checkout Record
        $checkout = Checkout::create([
            'checkin_id' => $checkin->id,
            'booking_id' => $booking->id,
            'user_id' => $request->user()->id,
            'checkout_datetime' => now(),
            'status' => 'completed'
        ]);

        // Update Checkin Status
        $checkin->update(['status' => 'checked_out']);

        // Update Booking Status
        $booking->update(['status' => 'completed']);

        // Update Room Status to available
        $room->update(['status' => 'available']);

        DB::commit();

        return response()->json([
            'message' => 'Checkout successful',
            'checkout' => $checkout
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Checkout error: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to process checkout: ' . $e->getMessage()], 500);
    }
}
}
