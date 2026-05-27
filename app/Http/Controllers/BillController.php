<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Booking;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillController extends Controller
{
    public function show($id)
    {
        $bill = Bill::with(['booking.guest', 'booking.room', 'billItems.addon', 'billDiscounts.discount', 'payments'])->findOrFail($id);
        return response()->json($bill);
    }

    public function getByBooking($booking_id)
    {
        $bill = Bill::with(['booking.guest', 'booking.room', 'billItems.addon', 'billDiscounts.discount', 'payments'])
                    ->where('booking_id', $booking_id)
                    ->firstOrFail();
        return response()->json($bill);
    }

    public function addItem(Request $request, $bill_id)
    {
        $validated = $request->validate([
            'addon_id' => 'required|exists:addons,id',
            'quantity' => 'required|integer|min:1',
            'custom_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $bill = Bill::findOrFail($bill_id);
            $addon = \App\Models\Addon::findOrFail($validated['addon_id']);

            $price = $validated['custom_price'] ?? $addon->price;
            $subtotal = $price * $validated['quantity'];

            // Create bill item
            \App\Models\BillItem::create([
                'bill_id' => $bill->id,
                'addon_id' => $addon->id,
                'quantity' => $validated['quantity'],
                'unit_price_at_time' => $price,
                'subtotal' => $subtotal,
                'added_by_user_id' => $request->user()->id,
                'notes' => $validated['notes'] ?? null
            ]);

            // Update bill totals
            $bill->addons_total += $subtotal;
            $bill->subtotal += $subtotal;
            $bill->total_amount += $subtotal;
            $bill->balance_due += $subtotal;
            $bill->save();

            DB::commit();

            return response()->json(['message' => 'Addon added to bill successfully', 'bill' => $bill->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bill AddItem error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add item to bill'], 500);
        }
    }

    public function applyDiscount(Request $request, $bill_id)
    {
        $validated = $request->validate([
            'discount_id' => 'required|exists:discounts,id',
            'approval_notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $bill = Bill::findOrFail($bill_id);
            $discount = \App\Models\Discount::findOrFail($validated['discount_id']);

            // Simple discount calculation
            $discountAmount = 0;
            if ($discount->discount_type === 'percentage') {
                $discountAmount = $bill->subtotal * ($discount->discount_value / 100);
            } elseif ($discount->discount_type === 'fixed') {
                $discountAmount = $discount->discount_value;
            } elseif ($discount->discount_type === 'sc_pwd') {
                // Approximate SC/PWD calculation (20% off room rate)
                $discountAmount = $bill->room_charge * 0.20;
            }

            \App\Models\BillDiscount::create([
                'bill_id' => $bill->id,
                'discount_id' => $discount->id,
                'discount_amount_applied' => $discountAmount,
                'approved_by_user_id' => $request->user()->id,
                'approval_notes' => $validated['approval_notes'] ?? null
            ]);

            // Update bill totals
            $bill->discount_total += $discountAmount;
            $bill->total_amount -= $discountAmount;
            $bill->balance_due -= $discountAmount;
            $bill->save();

            DB::commit();

            return response()->json(['message' => 'Discount applied successfully', 'bill' => $bill->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bill ApplyDiscount error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to apply discount'], 500);
        }
    }
}
