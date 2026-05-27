import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, FileText, CheckCircle, Plus, Receipt } from 'lucide-react';
import api from '../api';

export default function BillingPaymentWorkflow({ bookingId, onComplete }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [addonCharge, setAddonCharge] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBillDetails();
      fetchDiscounts();
    }
  }, [bookingId]);

  const fetchBillDetails = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      if (res.data && res.data.bill) {
         setBill(res.data.bill);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
     // Hardcoded for now. Can be replaced with actual API call if a discounts endpoint is created
     setDiscounts([
        {id: 1, name: 'Senior Citizen', percentage: 20},
        {id: 2, name: 'PWD', percentage: 20}
     ]);
  };

  const handleUpdateBill = async () => {
    try {
      const payload = {};
      if (addonCharge) payload.addons_charge = parseFloat(addonCharge);
      if (selectedDiscount) payload.discount_id = parseInt(selectedDiscount);

      const res = await api.put(`/bills/${bill.id}`, payload);
      setBill(res.data);
      alert('Bill updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update bill');
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount) return alert('Please enter payment amount');
    try {
      await api.post('/payments', {
        bill_id: bill.id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod
      });
      alert('Payment processed successfully!');
      fetchBillDetails();
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      alert('Payment failed');
    }
  };

  if (!bookingId) return <div className="p-4 text-center text-gray-500">Please select a booking to view billing details.</div>;
  if (loading) return <div className="p-4 text-center">Loading bill details...</div>;
  if (!bill) return <div className="p-4 text-center text-red-500">No bill found for this booking.</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto mt-4">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Receipt className="text-amber-500 w-8 h-8" />
        <h2 className="text-2xl font-bold text-gray-800">Checkout & Billing</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Bill Summary */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-700">Bill Summary</h3>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Room Charge:</span>
              <span className="font-medium">₱{parseFloat(bill.room_charge).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Add-ons Charge:</span>
              <span className="font-medium">₱{parseFloat(bill.addons_charge).toFixed(2)}</span>
            </div>
            {parseFloat(bill.discount_amount) > 0 && (
               <div className="flex justify-between text-green-600">
                 <span>Discount:</span>
                 <span>-₱{parseFloat(bill.discount_amount).toFixed(2)}</span>
               </div>
            )}
            <div className="border-t border-amber-200 pt-2 flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-amber-600">₱{parseFloat(bill.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-700">
              <span>Status:</span>
              <span className={`uppercase ${bill.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                {bill.status}
              </span>
            </div>
          </div>

          {bill.status !== 'paid' && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700">Update Bill</h4>
              <div>
                <label className="text-sm text-gray-600">Add-ons Amount (₱)</label>
                <input 
                  type="number" 
                  value={addonCharge}
                  onChange={(e) => setAddonCharge(e.target.value)}
                  className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-300 outline-none" 
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Apply Discount</label>
                <select 
                  value={selectedDiscount} 
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-300 outline-none"
                >
                  <option value="">None</option>
                  {discounts.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleUpdateBill}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition font-medium"
              >
                Update Bill Totals
              </button>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div>
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Process Payment</h3>
          
          {bill.status === 'paid' ? (
             <div className="bg-green-50 text-green-700 p-6 rounded-lg flex flex-col items-center justify-center text-center h-48 border border-green-200">
               <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
               <p className="font-bold text-lg">Fully Paid</p>
               <p className="text-sm mt-1">This bill has been completely settled.</p>
             </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Payment Amount (₱)</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-amber-300 outline-none" 
                  placeholder={bill.total_amount}
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center p-3 rounded border ${paymentMethod === 'cash' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <Banknote className="mb-1 w-5 h-5" />
                    <span className="text-xs font-medium">Cash</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex flex-col items-center p-3 rounded border ${paymentMethod === 'credit_card' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <CreditCard className="mb-1 w-5 h-5" />
                    <span className="text-xs font-medium">Card</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('gcash')}
                    className={`flex flex-col items-center p-3 rounded border ${paymentMethod === 'gcash' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <span className="text-blue-500 font-bold mb-1 text-lg leading-none">G</span>
                    <span className="text-xs font-medium">GCash</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition flex justify-center items-center gap-2 mt-4"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
