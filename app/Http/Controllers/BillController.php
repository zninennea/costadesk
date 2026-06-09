<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Booking;
use App\Models\Checkin;
use App\Models\Addon;
use App\Models\Discount;
use App\Models\BillItem;
use App\Models\BillDiscount;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillController extends Controller
{
    public function index()
    {
        $bills = Bill::with(['booking.guest', 'booking.room', 'payments'])->get();
        return response()->json($bills);
    }

    public function show($id)
    {
        $bill = Bill::with(['booking.guest', 'booking.room', 'billItems.addon', 'billDiscounts.discount', 'payments'])->findOrFail($id);
        return response()->json($bill);
    }

    public function getByBooking($booking_id)
    {
        try {
            Log::info('Getting bill for booking: ' . $booking_id);
            
            // Find checkin record for this booking
            $checkin = Checkin::where('booking_id', $booking_id)->first();
            
            if (!$checkin) {
                Log::warning('No check-in found for booking: ' . $booking_id);
                return response()->json(['error' => 'No check-in record found for this booking'], 404);
            }
            
            // Find bill for this checkin
            $bill = Bill::where('checkin_id', $checkin->id)
                ->with(['booking.guest', 'booking.room', 'billItems.addon', 'billDiscounts.discount', 'payments'])
                ->first();
            
            if (!$bill) {
                Log::warning('No bill found for checkin: ' . $checkin->id);
                return response()->json(['error' => 'No bill found for this check-in'], 404);
            }
            
            return response()->json($bill);
            
        } catch (\Exception $e) {
            Log::error('getByBooking error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['error' => 'Failed to retrieve bill: ' . $e->getMessage()], 500);
        }
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
            $addon = Addon::findOrFail($validated['addon_id']);

            $price = $validated['custom_price'] ?? $addon->price;
            $subtotal = $price * $validated['quantity'];

            BillItem::create([
                'bill_id' => $bill->id,
                'addon_id' => $addon->id,
                'quantity' => $validated['quantity'],
                'unit_price_at_time' => $price,
                'subtotal' => $subtotal,
                'added_by_user_id' => $request->user()->id,
                'notes' => $validated['notes'] ?? null
            ]);

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
            $discount = Discount::findOrFail($validated['discount_id']);
            $user = $request->user();

            $discountAmount = 0;
            if ($discount->discount_type === 'percentage') {
                $discountAmount = $bill->subtotal * ($discount->discount_value / 100);
            } elseif ($discount->discount_type === 'fixed') {
                $discountAmount = $discount->discount_value;
            } elseif ($discount->discount_type === 'sc_pwd') {
                $discountAmount = $bill->room_charge * 0.20;
            }

            $isManager = in_array($user->role, ['manager', 'admin']);

            $billDiscount = BillDiscount::create([
                'bill_id' => $bill->id,
                'discount_id' => $discount->id,
                'discount_amount_applied' => $discountAmount,
                'approved_by_user_id' => $isManager ? $user->id : null,
                'approved_at' => $isManager ? now() : null,
                'approval_notes' => $validated['approval_notes'] ?? null,
                'status' => $isManager ? 'approved' : 'pending'
            ]);

            if ($isManager) {
                $bill->discount_total += $discountAmount;
                $bill->total_amount -= $discountAmount;
                $bill->balance_due -= $discountAmount;
                $bill->save();
                
                DB::commit();
                return response()->json(['message' => 'Discount applied successfully', 'bill' => $bill->fresh()]);
            } else {
                DB::commit();
                return response()->json(['message' => 'Discount requested and pending manager approval.', 'bill' => $bill->fresh()]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bill ApplyDiscount error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to apply discount'], 500);
        }
    }

    public function approveDiscount(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            $billDiscount = BillDiscount::findOrFail($id);
            
            if ($billDiscount->status !== 'pending') {
                return response()->json(['error' => 'Discount is not pending'], 400);
            }

            $billDiscount->update([
                'status' => 'approved',
                'approved_by_user_id' => $request->user()->id,
                'approved_at' => now(),
                'approval_notes' => $request->input('notes')
            ]);

            $bill = $billDiscount->bill;
            $bill->discount_total += $billDiscount->discount_amount_applied;
            $bill->total_amount -= $billDiscount->discount_amount_applied;
            $bill->balance_due -= $billDiscount->discount_amount_applied;
            $bill->save();

            DB::commit();
            return response()->json(['message' => 'Discount approved successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to approve discount'], 500);
        }
    }

    public function rejectDiscount(Request $request, $id)
    {
        $billDiscount = BillDiscount::findOrFail($id);
        if ($billDiscount->status !== 'pending') {
            return response()->json(['error' => 'Discount is not pending'], 400);
        }

        $billDiscount->update([
            'status' => 'rejected',
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
            'approval_notes' => $request->input('notes')
        ]);

        return response()->json(['message' => 'Discount rejected successfully']);
    }

    public function getPendingDiscounts()
    {
        $pending = BillDiscount::with(['bill.booking.user', 'discount'])
            ->where('status', 'pending')
            ->get();
            
        return response()->json($pending);
    }
}