import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Users, Calendar, Clock, LogOut, User, Settings, 
  DollarSign, TrendingUp, PieChart, FileText, AlertCircle, Download,
  CheckCircle, XCircle, Home, Plus, Receipt, Activity, BarChart,
  ChevronRight, Bell, UserCheck, UserX, BookOpen, CreditCard
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

function ManagerDashboard() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

const [userData, setUserData] = useState({})

useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  setUserData(user)
}, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const [dashboardData, setDashboardData] = useState({
    revenue: { today: 0, yesterday: 0, week: 0, month: 0 },
    occupancy: { rate: 0, occupied: 0, total: 0 },
    reservations: { total: 0, walkIn: 0, online: 0, cancellations: 0 },
    pendingApprovals: [],
    revenueByRoom: [],
    complianceAlerts: []
  });
  const [bookingsList, setBookingsList] = useState([]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.start) queryParams.append('start_date', dateRange.start);
      if (dateRange.end) queryParams.append('end_date', dateRange.end);
      
      const statsRes = await api.get(`/reports/dashboard-stats?${queryParams.toString()}`);
      const stats = statsRes.data;
      
      const bookingsRes = await api.get('/bookings');
      const bookings = bookingsRes.data;
      setBookingsList(bookings);
      
      const cancellations = bookings.filter(b => b.status === 'cancellation_requested');
      
      setDashboardData({
        revenue: {
          today: stats.revenue.today,
          yesterday: stats.revenue.yesterday || 0,
          week: stats.revenue.this_week || 0,
          month: stats.revenue.this_month
        },
        occupancy: {
          rate: stats.occupancy.total > 0 ? Math.round((stats.occupancy.occupied / stats.occupancy.total) * 100) : 0,
          occupied: stats.occupancy.occupied,
          total: stats.occupancy.total
        },
        reservations: {
          total: bookings.length,
          walkIn: 0, // Mock
          online: bookings.length,
          cancellations: bookings.filter(b => b.status === 'cancelled').length
        },
        pendingApprovals: cancellations.map(c => ({
          id: c.id,
          type: "Cancellation",
          name: c.user?.first_name + ' ' + c.user?.last_name,
          amount: c.total_price,
          discount: "Requesting Refund"
        })),
        revenueByRoom: [],
        complianceAlerts: []
      });
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleApprove = async (id) => {
     try {
       await api.put(`/bookings/${id}`, { status: 'cancelled' });
       fetchData();
     } catch(e) {}
  };
  
  const handleDecline = async (id) => {
     try {
       await api.put(`/bookings/${id}`, { status: 'pending' });
       fetchData();
     } catch(e) {}
  };


  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    navigate('/login')
  }



  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm font-medium">Today: {currentTime.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Date Filter */}
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              Report Date Range
            </h2>
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
              <span className="text-gray-500">to</span>
              <input 
                type="date" 
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
              <button 
                onClick={() => setDateRange({start: '', end: ''})}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Revenue today</p>
                  <p className="text-3xl font-bold text-gray-800">₱{dashboardData.revenue.today.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">vs ₱{dashboardData.revenue.yesterday.toLocaleString()} yesterday</p>
                </div>
                <DollarSign size={32} className="text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Revenue this week</p>
                  <p className="text-3xl font-bold text-gray-800">₱{dashboardData.revenue.week.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">7-day rolling total</p>
                </div>
                <TrendingUp size={32} className="text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Revenue this month</p>
                  <p className="text-3xl font-bold text-gray-800">₱{dashboardData.revenue.month.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">May 2026</p>
                </div>
                <PieChart size={32} className="text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Occupancy rate</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData.occupancy.rate}%</p>
                  <p className="text-sm text-gray-500 mt-1">{dashboardData.occupancy.occupied} of {dashboardData.occupancy.total} rooms</p>
                </div>
                <Activity size={32} className="text-amber-500" />
              </div>
            </div>
          </div>

          {/* Reservation Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Reservation overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{dashboardData.reservations.total}</p>
                  <p className="text-sm text-gray-600">Total reservations</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dashboardData.reservations.walkIn}</p>
                  <p className="text-sm text-gray-600">Walk-in</p>
                  <p className="text-xs text-gray-500">{Math.round(dashboardData.reservations.walkIn / dashboardData.reservations.total * 100)}% of total</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{dashboardData.reservations.online}</p>
                  <p className="text-sm text-gray-600">Online bookings</p>
                  <p className="text-xs text-gray-500">{Math.round(dashboardData.reservations.online / dashboardData.reservations.total * 100)}% of total</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{dashboardData.reservations.cancellations}</p>
                  <p className="text-sm text-gray-600">Cancellations</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-amber-500" />
                Pending approvals
              </h3>
              <div className="space-y-3">
                {dashboardData.pendingApprovals.map((approval, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">{approval.type}</p>
                      <span className="text-sm text-yellow-600 px-2 py-0.5 rounded-full bg-yellow-100">Needs approval</span>
                    </div>
                    <p className="text-sm text-gray-600">{approval.name}</p>
                    <p className="text-sm font-semibold text-gray-800">₱{approval.amount.toLocaleString()} · {approval.discount}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleApprove(approval.id)} className="flex-1 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Approve</button>
                      <button onClick={() => handleDecline(approval.id)} className="flex-1 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )
    }

    if (activeTab === 'reservations') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Reservations List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 font-semibold text-gray-600">Booking Code</th>
                  <th className="p-3 font-semibold text-gray-600">Guest</th>
                  <th className="p-3 font-semibold text-gray-600">Room</th>
                  <th className="p-3 font-semibold text-gray-600">Check In - Out</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                  <th className="p-3 font-semibold text-gray-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-amber-600">{booking.booking_code || `CMB-${booking.id}`}</td>
                    <td className="p-3">{booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : 'Walk-in/Guest'}</td>
                    <td className="p-3">Room {booking.room?.room_number}</td>
                    <td className="p-3 text-sm">{booking.check_in} to {booking.check_out}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                        booking.status === 'confirmed' || booking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'checked_out' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold">₱{booking.total_price?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'revenue') {
      const completedBookings = bookingsList.filter(b => b.status === 'checked_out');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Revenue Ledger</h2>
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold">
              Total Realized: ₱{totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 font-semibold text-gray-600">Booking Code</th>
                  <th className="p-3 font-semibold text-gray-600">Checkout Date</th>
                  <th className="p-3 font-semibold text-gray-600">Guest</th>
                  <th className="p-3 font-semibold text-gray-600">Room</th>
                  <th className="p-3 font-semibold text-gray-600 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{booking.booking_code || `CMB-${booking.id}`}</td>
                    <td className="p-3">{new Date(booking.updated_at).toLocaleDateString()}</td>
                    <td className="p-3">{booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : 'Walk-in/Guest'}</td>
                    <td className="p-3">Room {booking.room?.room_number}</td>
                    <td className="p-3 text-right font-semibold text-green-600">₱{booking.total_price?.toLocaleString()}</td>
                  </tr>
                ))}
                {completedBookings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">No completed transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{activeTab}</h2>
        <p className="text-gray-500 mb-6">This section is currently under development.</p>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-30">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CoastaDesk</h1>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>
        <p className="text-xs text-amber-400">Manager</p>
      </div>

      <nav className="p-4 space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2">Main</div>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Operations</div>
        <button 
          onClick={() => setActiveTab('reservations')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reservations' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Calendar size={18} />
          Reservations
        </button>
        <button 
          onClick={() => setActiveTab('guests')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Users size={18} />
          Guests
        </button>
        <button 
          onClick={() => setActiveTab('rooms')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Home size={18} />
          Room status
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Finance</div>
        <button 
          onClick={() => setActiveTab('revenue')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'revenue' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <DollarSign size={18} />
          Revenue
        </button>
        <button 
          onClick={() => setActiveTab('discounts')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'discounts' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <CreditCard size={18} />
          SC/PWD Discounts
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <FileText size={18} />
          Reports
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">System</div>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Settings size={18} />
          Settings
        </button>
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, {userData.firstName || 'Manager'}!
                </h1>
                <p className="text-gray-500">Here's what's happening at the resort today.</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
                      {userData.firstName ? userData.firstName[0] : 'M'}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold text-gray-700">{userData.firstName} {userData.lastName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userData.role}</p>
                    </div>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{userData.email}</p>
                      </div>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={16} /> My Profile
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings size={16} /> Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`pb-3 text-sm font-medium transition-all ${
                  activeTab === 'dashboard' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard