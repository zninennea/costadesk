import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Calendar, Clock, LogOut, User, Settings,
  DollarSign, TrendingUp, PieChart, FileText, AlertCircle,
  CheckCircle, XCircle, Home, Plus, Receipt, Activity,
  ChevronRight, Bell, UserCheck, UserX, BookOpen, CreditCard
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import ReservationModal from '../../components/ReservationModal'
import RoomStatusBoard from '../../components/RoomStatusBoard'
import DiscountApprovalQueue from '../../components/DiscountApprovalQueue'

// Simple icon components
const ClipboardList = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);

const BarChartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

function ManagerDashboard() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [roomsList, setRoomsList] = useState([])
  const [bookingsList, setBookingsList] = useState([])
  const [userData, setUserData] = useState({})
  const [guestsList, setGuestsList] = useState([])
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)
  
  const [settings, setSettings] = useState({
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    checkoutTimeAlert: '12:00 PM',
    lateCheckoutFee: 500,
    pinCode: '1234'
  })

  const [dashboardData, setDashboardData] = useState({
    revenue: { today: 0, yesterday: 0, week: 0, month: 0 },
    occupancy: { rate: 0, occupied: 0, total: 0 },
    reservations: { total: 0, walkIn: 0, online: 0, cancellations: 0 },
    pendingApprovals: [],
    pendingDiscounts: [],
    violationsLog: []
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const saved = localStorage.getItem('managerSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.start) queryParams.append('start_date', dateRange.start);
      if (dateRange.end) queryParams.append('end_date', dateRange.end);

      const statsRes = await api.get(`/reports/dashboard-stats?${queryParams.toString()}`);
      const bookingsRes = await api.get('/bookings');
      const roomsRes = await api.get('/rooms');
      const violationsRes = await api.get('/guest-violations').catch(() => ({ data: [] }));
      const pendingDiscountsRes = await api.get('/bills/pending-discounts').catch(() => ({ data: [] }));
      const guestsRes = await api.get('/guests').catch(() => ({ data: [] }));

      const stats = statsRes.data || {};
      const bookings = bookingsRes.data || [];
      const rooms = roomsRes.data || [];

      setRoomsList(rooms);
      setBookingsList(bookings);
      setGuestsList(guestsRes.data || []);

      const cancellations = bookings.filter(b => b.status === 'cancellation_requested');
      const checkedInBookings = bookings.filter(b => b.status === 'checked_in');
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Helper to get guest name
      const getGuestName = (booking) => {
        if (booking.user?.first_name) return `${booking.user.first_name} ${booking.user.last_name}`;
        if (booking.guest?.first_name) return `${booking.guest.first_name} ${booking.guest.last_name}`;
        return `Guest ${booking.id}`;
      };

      setDashboardData({
        revenue: {
          today: stats.today_revenue || 0,
          yesterday: 0,
          week: 0,
          month: stats.monthly_revenue || 0
        },
        occupancy: {
          rate: occupancyRate,
          occupied: occupiedRooms,
          total: totalRooms
        },
        reservations: {
          total: bookings.length,
          walkIn: bookings.filter(b => b.is_walk_in || b.source_channel === 'walk_in').length,
          online: bookings.filter(b => b.source_channel === 'website').length,
          cancellations: bookings.filter(b => b.status === 'cancelled').length
        },
        pendingApprovals: cancellations.map(c => ({
          id: c.id,
          type: "Cancellation Request",
          name: getGuestName(c),
          amount: c.total_price || 0,
          discount: "Requesting Refund"
        })),
        pendingDiscounts: pendingDiscountsRes.data || [],
        violationsLog: violationsRes.data || []
      });

    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleConfirmBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'confirmed' })
      alert("Booking confirmed successfully.")
      fetchData()
    } catch (e) {
      alert("Failed to confirm booking.")
    }
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' })
      alert("Booking cancelled successfully.")
      fetchData()
    } catch (e) {
      alert("Failed to cancel booking.")
    }
  }

  const handleApproveDiscount = async (id) => {
    try {
      await api.post(`/bills/discounts/${id}/approve`);
      alert("Discount approved.");
      fetchData();
    } catch (e) {
      alert("Failed to approve discount.");
    }
  }

  const handleRejectDiscount = async (id) => {
    try {
      await api.post(`/bills/discounts/${id}/reject`);
      alert("Discount rejected.");
      fetchData();
    } catch (e) {
      alert("Failed to reject discount.");
    }
  }

  const handleSaveReservation = async (data) => {
    try {
      await api.post('/bookings/manual-reserve', data)
      alert("Reservation created successfully!")
      setShowReservationModal(false)
      fetchData()
    } catch (e) {
      console.error(e)
      alert(e.response?.data?.message || "Failed to create reservation")
    }
  }

  const handleToggleBlacklist = async (guest) => {
    setSelectedGuest(guest);
    setBlacklistReason(guest.blacklist_reason || '');
    setShowBlacklistModal(true);
  };

  const handleSaveBlacklist = async () => {
    try {
      await api.post(`/guests/${selectedGuest.id}/blacklist`, {
        is_blacklisted: !selectedGuest.is_blacklisted,
        blacklist_reason: !selectedGuest.is_blacklisted ? blacklistReason : null
      });
      alert('Guest blacklist status updated successfully!');
      setShowBlacklistModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update blacklist status');
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('managerSettings', JSON.stringify(settings));
    alert('System settings saved successfully!');
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-neutral-800 text-white shadow-xl z-30 overflow-y-auto">
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CoastaDesk</h1>
            <p className="text-xs text-neutral-400">Management System</p>
          </div>
        </div>
        <p className="text-xs text-secondary-400">Manager</p>
      </div>

      <nav className="p-4 space-y-1">
        <div className="text-xs text-neutral-500 uppercase tracking-wider px-3 py-2">Main</div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <div className="text-xs text-neutral-500 uppercase tracking-wider px-3 py-2 mt-4">Operations</div>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reservations' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Calendar size={18} />
          Reservations
        </button>
        <button
          onClick={() => setActiveTab('guests')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Users size={18} />
          Guests
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Home size={18} />
          Room Status
        </button>
        <button
          onClick={() => setActiveTab('violations')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'violations' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <ClipboardList size={18} />
          Violation Log
        </button>

        <div className="text-xs text-neutral-500 uppercase tracking-wider px-3 py-2 mt-4">Finance</div>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'revenue' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <DollarSign size={18} />
          Revenue
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'discounts' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <CreditCard size={18} />
          Discounts
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <FileText size={18} />
          Reports
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Settings size={18} />
          System Settings
        </button>
      </nav>
    </div>
  );

  // Helper function to get guest name
  const getGuestName = (booking) => {
    if (booking.user?.first_name) return `${booking.user.first_name} ${booking.user.last_name}`;
    if (booking.guest?.first_name) return `${booking.guest.first_name} ${booking.guest.last_name}`;
    return `Guest ${booking.id}`;
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Revenue today</p>
                  <p className="text-2xl font-bold text-neutral-800">₱{dashboardData.revenue.today.toLocaleString()}</p>
                </div>
                <DollarSign size={28} className="text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-secondary-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Revenue this month</p>
                  <p className="text-2xl font-bold text-neutral-800">₱{dashboardData.revenue.month.toLocaleString()}</p>
                </div>
                <TrendingUp size={28} className="text-secondary-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Occupancy rate</p>
                  <p className="text-2xl font-bold text-neutral-800">{dashboardData.occupancy.rate}%</p>
                  <p className="text-xs text-neutral-400 mt-1">{dashboardData.occupancy.occupied} of {dashboardData.occupancy.total} rooms</p>
                </div>
                <Home size={28} className="text-primary-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm font-medium">Total Bookings</p>
                  <p className="text-2xl font-bold text-neutral-800">{dashboardData.reservations.total}</p>
                </div>
                <Calendar size={28} className="text-purple-500" />
              </div>
            </div>
          </div>

          {/* Pending Approvals Section */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-secondary-500" />
              Pending Approvals
            </h3>
            {dashboardData.pendingApprovals.length === 0 && dashboardData.pendingDiscounts.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.pendingDiscounts.map((discount) => (
                  <div key={discount.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-800">Discount Request</p>
                      <p className="text-sm text-neutral-500">{discount.discount?.discount_name || 'SC/PWD'}</p>
                      <p className="text-xs text-secondary-600">Amount: ₱{parseFloat(discount.discount_amount_applied || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveDiscount(discount.id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Approve</button>
                      <button onClick={() => handleRejectDiscount(discount.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'reservations') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Reservations List</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Booking Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-primary-600">{booking.booking_code || `CMB-${booking.id}`}</td>
                    <td className="px-4 py-3 text-sm">{getGuestName(booking)}</td>
                    <td className="px-4 py-3 text-sm">Room {booking.room?.room_number}</td>
                    <td className="px-4 py-3 text-sm">{booking.check_in} → {booking.check_out}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleConfirmBooking(booking.id)} className="p-1 bg-green-100 text-green-700 rounded" title="Confirm">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleCancelBooking(booking.id)} className="p-1 bg-red-100 text-red-700 rounded" title="Cancel">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {bookingsList.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-neutral-400">No reservations found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'violations') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Violation Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Violation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.violationsLog.map(log => (
                  <tr key={log.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm">{new Date(log.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium">{log.guest_name}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{log.violation_type}</td>
                    <td className="px-4 py-3 text-sm">{log.action_taken || '-'}</td>
                  </tr>
                ))}
                {dashboardData.violationsLog.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-neutral-400">No violations recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'revenue') {
      const completedBookings = bookingsList.filter(b => b.status === 'checked_out');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-neutral-800">Revenue Ledger</h2>
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold">
              Total: ₱{totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr><th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Booking</th><th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Guest</th><th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Amount</th></tr>
              </thead>
              <tbody>
                {completedBookings.map(b => (
                  <tr key={b.id} className="border-b"><td className="px-4 py-3">{b.booking_code}</td><td className="px-4 py-3">{getGuestName(b)}</td><td className="px-4 py-3 text-green-600 font-medium">₱{b.total_price?.toLocaleString()}</td></tr>
                ))}
                {completedBookings.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-neutral-400">No completed transactions</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'discounts') {
      return <DiscountApprovalQueue />;
    }

    if (activeTab === 'rooms') {
      return <RoomStatusBoard />;
    }

    if (activeTab === 'guests') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Guests Catalog</h2>
            <div className="text-sm text-gray-500">
              Total Guests: <span className="font-bold text-gray-800">{guestsList.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 font-semibold text-gray-600">Name</th>
                  <th className="p-3 font-semibold text-gray-600">Email</th>
                  <th className="p-3 font-semibold text-gray-600">Mobile</th>
                  <th className="p-3 font-semibold text-gray-600">Location</th>
                  <th className="p-3 font-semibold text-gray-600">Blacklisted</th>
                  <th className="p-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(guestsList || []).map(guest => (
                  <tr key={guest.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{guest.first_name} {guest.last_name}</td>
                    <td className="p-3">{guest.email || 'N/A'}</td>
                    <td className="p-3">{guest.mobile || guest.phone || 'N/A'}</td>
                    <td className="p-3">{guest.city ? `${guest.city}, ${guest.country || 'Philippines'}` : 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${guest.is_blacklisted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {guest.is_blacklisted ? 'Yes' : 'No'}
                      </span>
                      {guest.is_blacklisted && guest.blacklist_reason && (
                        <p className="text-xs text-red-500 italic mt-1">{guest.blacklist_reason}</p>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleBlacklist(guest)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                          guest.is_blacklisted 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {guest.is_blacklisted ? 'Whitelist' : 'Blacklist'}
                      </button>
                    </td>
                  </tr>
                ))}
                {(!guestsList || guestsList.length === 0) && (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-neutral-400">No guests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Preferences</h2>
            <p className="text-sm text-gray-500">Configure resort-wide policies and system behaviors</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Resort Policy Configurations</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Standard Checkout Time</label>
                <input
                  type="text"
                  value={settings.checkoutTimeAlert}
                  onChange={(e) => setSettings({ ...settings, checkoutTimeAlert: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. 12:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Late Checkout Fee (₱)</label>
                <input
                  type="number"
                  value={settings.lateCheckoutFee}
                  onChange={(e) => setSettings({ ...settings, lateCheckoutFee: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Manager Override PIN</label>
                <input
                  type="password"
                  value={settings.pinCode}
                  onChange={(e) => setSettings({ ...settings, pinCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. 1234"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Notification Preferences</h3>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm">Email Alerts for Reservations</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 accent-primary-600"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm">SMS Reminders for Check-out</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="w-5 h-5 accent-primary-600"
                />
              </label>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 text-sm"
            >
              Save Settings
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === 'reports') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border rounded-lg text-left hover:bg-neutral-50">📊 Daily Sales Report</button>
            <button className="p-4 border rounded-lg text-left hover:bg-neutral-50">📈 Occupancy Report</button>
            <button className="p-4 border rounded-lg text-left hover:bg-neutral-50">💰 Revenue Summary</button>
            <button className="p-4 border rounded-lg text-left hover:bg-neutral-50">👥 Guest History Report</button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Sidebar />

      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">Manager Dashboard</h1>
                <p className="text-sm text-neutral-500">{currentTime.toLocaleString()}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100"
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-neutral-800">{userData.firstName || 'Manager'}</p>
                    <p className="text-xs text-neutral-500">Manager</p>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-6 border-t mt-3 pt-3">
              <button onClick={() => setActiveTab('dashboard')} className={`text-sm ${activeTab === 'dashboard' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('guests')} className={`text-sm ${activeTab === 'guests' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Guests</button>
              <button onClick={() => setActiveTab('rooms')} className={`text-sm ${activeTab === 'rooms' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Room Status</button>
              <button onClick={() => setActiveTab('reservations')} className={`text-sm ${activeTab === 'reservations' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Reservations</button>
              <button onClick={() => setActiveTab('discounts')} className={`text-sm ${activeTab === 'discounts' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Discounts</button>
              <button onClick={() => setActiveTab('settings')} className={`text-sm ${activeTab === 'settings' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Settings</button>
              <button onClick={() => setShowReservationModal(true)} className="text-sm bg-primary-600 text-white px-3 py-1 rounded-lg">+ New Reservation</button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onSave={handleSaveReservation}
        rooms={roomsList}
      />

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {selectedGuest.is_blacklisted ? 'Whitelist Guest' : 'Blacklist Guest'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Confirm updating the blacklist status of <span className="font-semibold text-gray-800">{selectedGuest.first_name} {selectedGuest.last_name}</span>.
            </p>
            {!selectedGuest.is_blacklisted && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2 text-sm">Reason for Blacklisting</label>
                <textarea
                  required
                  placeholder="State the reason for blacklisting this guest..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  rows="3"
                  value={blacklistReason}
                  onChange={e => setBlacklistReason(e.target.value)}
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSaveBlacklist}
                className={`flex-1 py-2 text-white font-semibold rounded-lg transition ${
                  selectedGuest.is_blacklisted 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedGuest.is_blacklisted ? 'Confirm Whitelist' : 'Confirm Blacklist'}
              </button>
              <button
                type="button"
                onClick={() => setShowBlacklistModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard