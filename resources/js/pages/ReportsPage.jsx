import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign, Bed } from 'lucide-react';
import api from '../api';
import Sidebar from '../components/Sidebar';

export default function ReportsPage({ role }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reports/dashboard-stats', {
                params: { start_date: dateRange.start_date, end_date: dateRange.end_date }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    };

    const handleExport = () => {
        alert('Export to PDF/Excel functionality will be implemented');
    };

    return (
        <div className="flex h-screen bg-neutral-50">
            <Sidebar role={role} onLogout={handleLogout} />

            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-800">Reports & Analytics</h1>
                            <p className="text-neutral-500 mt-1">View and export business reports</p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                            <Download size={18} />
                            Export Report
                        </button>
                    </div>

                    {/* Date Range Picker */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-primary-600" />
                            Select Date Range
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm text-neutral-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.start_date}
                                    onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.end_date}
                                    onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setDateRange({
                                        start_date: new Date().toISOString().split('T')[0],
                                        end_date: new Date().toISOString().split('T')[0]
                                    })}
                                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setDateRange({
                                        start_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
                                        end_date: new Date().toISOString().split('T')[0]
                                    })}
                                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                                >
                                    Last 7 Days
                                </button>
                                <button
                                    onClick={() => setDateRange({
                                        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                                        end_date: new Date().toISOString().split('T')[0]
                                    })}
                                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                                >
                                    This Month
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {!loading && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <DollarSign size={24} className="text-primary-600" />
                                    <h3 className="font-semibold text-neutral-700">Revenue</h3>
                                </div>
                                <p className="text-2xl font-bold text-neutral-800">₱{stats.filtered_revenue?.toLocaleString() || 0}</p>
                                <p className="text-sm text-neutral-500 mt-2">For selected period</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Bed size={24} className="text-primary-600" />
                                    <h3 className="font-semibold text-neutral-700">Occupancy</h3>
                                </div>
                                <p className="text-2xl font-bold text-neutral-800">{stats.occupancy_rate}%</p>
                                <p className="text-sm text-neutral-500 mt-2">{stats.occupied_rooms} of {stats.total_rooms} rooms</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users size={24} className="text-primary-600" />
                                    <h3 className="font-semibold text-neutral-700">Total Guests</h3>
                                </div>
                                <p className="text-2xl font-bold text-neutral-800">{stats.total_guests}</p>
                                <p className="text-sm text-neutral-500 mt-2">Registered customers</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp size={24} className="text-primary-600" />
                                    <h3 className="font-semibold text-neutral-700">Total Bookings</h3>
                                </div>
                                <p className="text-2xl font-bold text-neutral-800">{stats.total_bookings}</p>
                                <p className="text-sm text-neutral-500 mt-2">All-time reservations</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-neutral-500 mt-4">Loading reports...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}