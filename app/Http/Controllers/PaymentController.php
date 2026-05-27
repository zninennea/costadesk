<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Bill;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bill_id' => 'required|exists:bills,id',
            'amount_paid' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,credit_card,debit_card,gcash,paymaya,bank_transfer',
            'reference_number' => 'nullable|string',
            'card_last_four' => 'nullable|string|max:4',
            'approval_code' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $bill = Bill::findOrFail($validated['bill_id']);

            $payment = Payment::create([
                'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                'bill_id' => $bill->id,
                'guest_id' => $bill->guest_id,
                'processed_by_user_id' => $request->user()->id,
                'amount_paid' => $validated['amount_paid'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'card_last_four' => $validated['card_last_four'] ?? null,
                'approval_code' => $validated['approval_code'] ?? null,
                'payment_datetime' => now(),
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null
            ]);
            
            $totalPaid = $bill->payments()->where('status', 'completed')->sum('amount_paid');
            
            $bill->paid_amount = $totalPaid;
            $bill->balance_due = max(0, $bill->total_amount - $totalPaid);

            if ($bill->balance_due <= 0) {
                $bill->status = 'paid';
                $bill->paid_at = now();
            } elseif ($totalPaid > 0) {
                $bill->status = 'partial';
            }

            $bill->save();

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['message' => 'Payment processed successfully', 'payment' => $payment, 'bill' => $bill->fresh()]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Payment error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process payment'], 500);
        }
    }
}
