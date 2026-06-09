import React, { useState, useEffect } from 'react';
import { AlertTriangle, Flag, CheckCircle, XCircle, Plus, Search, Eye } from 'lucide-react';
import api from '../api';

export default function ViolationsLog({ userRole }) {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        guest_name: '',
        room_number: '',
        violation_type: '',
        description: '',
        action_taken: '',
        booking_id: null
    });
    const [editingId, setEditingId] = useState(null);
    const [bookings, setBookings] = useState([]);

    const violationTypes = [
        'Noise Complaint',
        'Outside Food/Drinks',
        'Smoking in Non-Smoking Area',
        'Pets Allowed',
        'Damage to Property',
        'Diving from Wharf',
        'Unauthorized Appliances',
        'Horseplay / Unsafe Behavior',
        'Illegal Substances',
        'Fishing in Restricted Area',
        'Other'
    ];

    const actionOptions = [
        'Verbal Warning',
        'Written Warning',
        'Fine Applied',
        'Eviction',
        'Police Reported',
        'Blacklisted',
        'No Action'
    ];

    useEffect(() => {
        fetchViolations();
        fetchBookings();
    }, []);

    const fetchViolations = async () => {
        try {
            const res = await api.get('/guest-violations');
            setViolations(res.data);
        } catch (err) {
            console.error('Failed to fetch violations', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            const activeBookings = res.data.filter(b =>
                ['pending', 'confirmed', 'checked_in'].includes(b.status)
            );
            setBookings(activeBookings);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/guest-violations/${editingId}`, formData);
            } else {
                await api.post('/guest-violations', formData);
            }
            resetForm();
            fetchViolations();
            setShowModal(false);
        } catch (err) {
            console.error('Failed to save violation', err);
            alert('Error saving violation record');
        }
    };

    const handleEdit = (violation) => {
        setFormData({
            guest_name: violation.guest_name,
            room_number: violation.room_number || '',
            violation_type: violation.violation_type,
            description: violation.description || '',
            action_taken: violation.action_taken || '',
            booking_id: violation.booking_id || null
        });
        setEditingId(violation.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this violation record?')) return;
        try {
            await api.delete(`/guest-violations/${id}`);
            fetchViolations();
        } catch (err) {
            console.error('Failed to delete violation', err);
            alert('Error deleting violation record');
        }
    };

    const resetForm = () => {
        setFormData({
            guest_name: '',
            room_number: '',
            violation_type: '',
            description: '',
            action_taken: '',
            booking_id: null
        });
        setEditingId(null);
    };

    const getViolationColor = (type) => {
        const severe = ['Damage to Property', 'Illegal Substances', 'Eviction'];
        const moderate = ['Noise Complaint', 'Smoking in Non-Smoking Area', 'Unauthorized Appliances'];

        if (severe.includes(type)) return 'text-red-600 bg-red-50';
        if (moderate.includes(type)) return 'text-orange-600 bg-orange-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    const filteredViolations = violations.filter(v => {
        const matchesSearch = v.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.violation_type?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                        <AlertTriangle size={24} className="text-primary-600" />
                        Guest Violations Log
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">Track and manage guest policy violations</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus size={18} />
                    Record Violation
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by guest name, room number, or violation type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                    <option value="all">All Violations</option>
                    <option value="severe">Severe</option>
                    <option value="moderate">Moderate</option>
                    <option value="minor">Minor</option>
                </select>
            </div>

            {/* Violations Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-neutral-500 mt-4">Loading violations...</p>
                </div>
            ) : filteredViolations.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <Flag size={48} className="text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">No violations recorded yet</p>
                    <p className="text-neutral-400 text-sm mt-1">Click "Record Violation" to log a policy violation</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Guest</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Room</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Violation Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Action Taken</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Date</th>
                                {(userRole === 'manager' || userRole === 'admin') && (
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredViolations.map((violation) => (
                                <tr key={violation.id} className="hover:bg-neutral-50 transition">
                                    <td className="px-4 py-3 text-neutral-700">{violation.guest_name}</td>
                                    <td className="px-4 py-3 text-neutral-500">{violation.room_number || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getViolationColor(violation.violation_type)}`}>
                                            {violation.violation_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">{violation.description || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-neutral-600 text-sm">{violation.action_taken || 'Pending'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-sm">
                                        {new Date(violation.created_at).toLocaleDateString()}
                                    </td>
                                    {(userRole === 'manager' || userRole === 'admin') && (
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(violation)}
                                                    className="p-1 text-neutral-400 hover:text-primary-600 transition"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(violation.id)}
                                                    className="p-1 text-neutral-400 hover:text-red-600 transition"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-neutral-800">
                                {editingId ? 'Edit Violation Record' : 'Record New Violation'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-700 font-medium mb-1">Guest Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.guest_name}
                                        onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="Enter guest name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-700 font-medium mb-1">Room Number</label>
                                    <input
                                        type="text"
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., 101, Cottage A"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-700 font-medium mb-1">Violation Type *</label>
                                <select
                                    required
                                    value={formData.violation_type}
                                    onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select violation type</option>
                                    {violationTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-neutral-700 font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Describe what happened..."
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-700 font-medium mb-1">Action Taken</label>
                                <select
                                    value={formData.action_taken}
                                    onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select action taken</option>
                                    {actionOptions.map(action => (
                                        <option key={action} value={action}>{action}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                                >
                                    {editingId ? 'Update Violation' : 'Record Violation'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}