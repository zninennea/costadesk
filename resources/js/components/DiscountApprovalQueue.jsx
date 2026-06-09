import React, { useState, useEffect } from 'react';
import { Percent, CheckCircle, XCircle, Clock, AlertCircle, User, DollarSign } from 'lucide-react';
import api from '../api';

export default function DiscountApprovalQueue() {
    const [pendingDiscounts, setPendingDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [approvalNotes, setApprovalNotes] = useState('');

    useEffect(() => {
        fetchPendingDiscounts();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchPendingDiscounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPendingDiscounts = async () => {
        try {
            const res = await api.get('/bills/pending-discounts');
            setPendingDiscounts(res.data);
        } catch (err) {
            console.error('Failed to fetch pending discounts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (discountId) => {
        if (!window.confirm('Approve this discount request?')) return;
        try {
            await api.post(`/bills/discounts/${discountId}/approve`, { notes: approvalNotes });
            alert('Discount approved successfully');
            setSelectedDiscount(null);
            setApprovalNotes('');
            fetchPendingDiscounts();
        } catch (err) {
            console.error('Failed to approve discount', err);
            alert('Error approving discount');
        }
    };

    const handleReject = async (discountId) => {
        if (!window.confirm('Reject this discount request?')) return;
        try {
            await api.post(`/bills/discounts/${discountId}/reject`, { notes: approvalNotes });
            alert('Discount rejected');
            setSelectedDiscount(null);
            setApprovalNotes('');
            fetchPendingDiscounts();
        } catch (err) {
            console.error('Failed to reject discount', err);
            alert('Error rejecting discount');
        }
    };

    const getDiscountTypeLabel = (type) => {
        switch (type) {
            case 'sc_pwd': return 'Senior Citizen / PWD';
            case 'percentage': return 'Percentage Discount';
            case 'fixed': return 'Fixed Amount Discount';
            default: return type;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Percent size={24} className="text-secondary-600" />
                <div>
                    <h2 className="text-xl font-bold text-neutral-800">Discount Approval Queue</h2>
                    <p className="text-neutral-500 text-sm">Review and approve/decline discount requests</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-secondary-700">
                        <Clock size={18} />
                        <span className="font-semibold">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-800 mt-1">{pendingDiscounts.length}</p>
                    <p className="text-sm text-secondary-600">Awaiting review</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                        <AlertCircle size={18} />
                        <span className="font-semibold">Total Requests</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">{pendingDiscounts.length}</p>
                    <p className="text-sm text-neutral-500">Current queue</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary-700">
                        <DollarSign size={18} />
                        <span className="font-semibold">Total Discount Value</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-800 mt-1">
                        ₱{pendingDiscounts.reduce((sum, d) => sum + parseFloat(d.discount_amount_applied || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-primary-600">If all approved</p>
                </div>
            </div>

            {/* Pending Discounts List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-neutral-500 mt-4">Loading requests...</p>
                </div>
            ) : pendingDiscounts.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <CheckCircle size={48} className="text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No pending discount requests</p>
                    <p className="text-neutral-400 text-sm mt-1">All discounts have been processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingDiscounts.map((discount) => (
                        <div key={discount.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Left side - Discount info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.discount?.discount_type === 'sc_pwd'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-secondary-100 text-secondary-700'
                                            }`}>
                                            {getDiscountTypeLabel(discount.discount?.discount_type)}
                                        </span>
                                        <span className="text-xs text-neutral-400">
                                            Requested: {new Date(discount.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-neutral-800">{discount.discount?.discount_name || 'Discount Request'}</p>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        Code: <span className="font-mono">{discount.discount?.discount_code}</span>
                                    </p>
                                    {discount.approval_notes && (
                                        <p className="text-sm text-neutral-500 mt-2 italic">"{discount.approval_notes}"</p>
                                    )}
                                </div>

                                {/* Right side - Bill info */}
                                <div className="bg-neutral-50 rounded-lg p-3 min-w-[200px]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600">Subtotal:</span>
                                        <span className="font-medium">₱{parseFloat(discount.bill?.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-secondary-600">
                                        <span>Discount Applied:</span>
                                        <span className="font-bold">-₱{parseFloat(discount.discount_amount_applied).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold border-t border-neutral-200 mt-2 pt-2">
                                        <span>Total:</span>
                                        <span>₱{(parseFloat(discount.bill?.subtotal || 0) - parseFloat(discount.discount_amount_applied)).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => {
                                            setSelectedDiscount(discount.id);
                                            handleApprove(discount.id);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedDiscount(discount.id);
                                            handleReject(discount.id);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Guest Info if available */}
                            {discount.bill?.booking?.user && (
                                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
                                    <User size={12} />
                                    <span>Requested by: {discount.bill.booking.user.first_name} {discount.bill.booking.user.last_name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Approval Notes Modal (optional) */}
            {selectedDiscount && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-neutral-800 mb-4">Add Notes (Optional)</h3>
                        <textarea
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            placeholder="Add any notes or reason for this decision..."
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
                            rows="3"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedDiscount(null)}
                                className="flex-1 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}