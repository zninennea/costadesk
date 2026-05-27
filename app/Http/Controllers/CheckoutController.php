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
                return response()->json(['error' => 'No bill found for this checkin.'], 400);
            }

            if ($bill->balance_due > 0) {
                return response()->json([
                    'error' => 'Cannot checkout. Guest still has a pending balance.',
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

            // Update Room Status to Maintenance/Cleaning
            $room->update(['status' => 'cleaning']);

            DB::commit();

            return response()->json([
                'message' => 'Checkout successful',
                'checkout' => $checkout
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process checkout'], 500);
        }
    }
}
