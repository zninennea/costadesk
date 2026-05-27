import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Users, Calendar, LogOut, User, Settings, 
  Home, Plus, FileText, AlertCircle, Shield, Database,
  HardDrive, Tag, Server, Activity, Bell, UserPlus,
  Edit, Archive, Trash2, Key, CheckCircle, XCircle, Clock
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api'

function AdminDashboard() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomsList, setRoomsList] = useState([])
  const [newRoom, setNewRoom] = useState({ room_number: '', category_id: '1', status: 'available' })
  const [usersList, setUsersList] = useState([])
  const [addonsList, setAddonsList] = useState([])
  const [activityLogs, setActivityLogs] = useState([])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const [systemData, setSystemData] = useState({
    staff: { total: 0, frontDesk: 0, manager: 0, other: 0 },
    rooms: { total: 0, inactive: 0, maintenance: 0, active: 0 },
    guests: { total: 0, allTime: true },
    addOns: { total: 18, categories: 4 },
    recentActivity: [],
    quickStats: { checkIns: 0, checkOuts: 0, active: 0 }
  });
  
  const [userData, setUserData] = useState({});

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.start) queryParams.append('start_date', dateRange.start);
      if (dateRange.end) queryParams.append('end_date', dateRange.end);

      const statsRes = await api.get(`/reports/dashboard-stats?${queryParams.toString()}`);
      const stats = statsRes.data;

      const usersRes = await api.get('/users');
      const roomsRes = await api.get('/rooms');
      const bookingsRes = await api.get('/bookings');
      
      const users = usersRes.data;
      const rooms = roomsRes.data;
      const bookings = bookingsRes.data;
      
      setRoomsList(rooms);
      
      const staffUsers = users.filter(u => u.role !== 'guest');
      const guestUsers = users.filter(u => u.role === 'guest');
      
      setUsersList(users);
      
      const addonsRes = await api.get('/addons?all=true').catch(()=>({data:[]}));
      setAddonsList(addonsRes.data);
      
      const logsRes = await api.get('/reports/activity-logs').catch(()=>({data:[]}));
      setActivityLogs(logsRes.data);
      
      const today = new Date().toISOString().split('T')[0];
      const incoming = bookings.filter(b => b.status === 'pending' && b.check_in <= today);
      const checkouts = bookings.filter(b => b.status === 'checked_in' && b.check_out <= today);
      
      setSystemData({
        staff: { 
          total: staffUsers.length, 
          frontDesk: staffUsers.filter(u => u.role === 'staff').length, 
          manager: staffUsers.filter(u => u.role === 'manager').length, 
          other: staffUsers.filter(u => u.role === 'admin').length 
        },
        rooms: { 
          total: rooms.length, 
          inactive: rooms.filter(r => r.status === 'inactive').length, 
          maintenance: rooms.filter(r => r.status === 'maintenance').length, 
          active: rooms.filter(r => r.status === 'available' || r.status === 'occupied').length 
        },
        guests: { total: guestUsers.length, allTime: true },
        addOns: { total: addonsRes.data.length, categories: new Set(addonsRes.data.map(a => a.addon_type)).size },
        recentActivity: logsRes.data.map(log => ({
           action: log.description,
           role: log.user ? log.user.role : 'system',
           date: new Date(log.created_at).toLocaleDateString(),
           time: new Date(log.created_at).toLocaleTimeString()
        })).slice(0, 5),
        quickStats: {
          checkIns: stats.today_check_ins,
          checkOuts: stats.today_check_outs,
          active: bookings.filter(b => b.status === 'checked_in').length
        }
      });
      
    } catch(e) {
       console.error(e);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
  }, []);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const handleAddRoom = async () => {
    try {
      await api.post('/rooms', newRoom);
      alert('Room added successfully!');
      fetchData();
      setNewRoom({ room_number: '', category_id: '1', status: 'available' });
    } catch(e) {
      alert('Failed to add room.');
    }
  }

  const handleToggleMaintenance = async (roomId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'maintenance' ? 'available' : 'maintenance';
      await api.put(`/rooms/${roomId}`, { status: newStatus });
      fetchData();
    } catch(e) {
      alert('Failed to update room status.');
    }
  }

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-30 overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CoastaDesk</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
        <p className="text-xs text-amber-400">Administrator</p>
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
          onClick={() => setActiveTab('billing')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'billing' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <CreditCardIcon size={18} />
          Billing & payments
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">System Config</div>
        <button 
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Users size={18} />
          User accounts
        </button>
        <button 
          onClick={() => setShowRoomModal(true)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-gray-300 hover:bg-gray-700`}
        >
          <Home size={18} />
          Room management
        </button>
        <button 
          onClick={() => setActiveTab('addons')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'addons' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Tag size={18} />
          Add-ons catalog
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'roles' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Shield size={18} />
          Role permissions
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Data</div>
        <button 
          onClick={() => setActiveTab('archives')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'archives' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Archive size={18} />
          Archived records
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <FileText size={18} />
          All reports
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'activity' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Activity size={18} />
          Activity log
        </button>
      </nav>
    </div>
  )

  // CreditCard icon component
  const CreditCardIcon = ({ size, className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  )

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          {/* Date Filter */}
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
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

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Active staff accounts</p>
                  <p className="text-3xl font-bold text-gray-800">{systemData.staff.total}</p>
                  <p className="text-sm text-gray-500 mt-1">{systemData.staff.frontDesk} front desk, {systemData.staff.manager} manager</p>
                </div>
                <Users size={32} className="text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total rooms/cottages</p>
                  <p className="text-3xl font-bold text-gray-800">{systemData.rooms.total}</p>
                  <p className="text-sm text-gray-500 mt-1">{systemData.rooms.inactive} inactive, {systemData.rooms.maintenance} maintenance</p>
                </div>
                <Home size={32} className="text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Registered guests</p>
                  <p className="text-3xl font-bold text-gray-800">{systemData.guests.total}</p>
                  <p className="text-sm text-gray-500 mt-1">All time</p>
                </div>
                <Database size={32} className="text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Add-on items</p>
                  <p className="text-3xl font-bold text-gray-800">{systemData.addOns.total}</p>
                  <p className="text-sm text-gray-500 mt-1">Across {systemData.addOns.categories} categories</p>
                </div>
                <Tag size={32} className="text-amber-500" />
              </div>
            </div>
          </div>

          {/* Admin Access Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Admin access areas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UserPlus size={20} className="text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">User management</p>
                      <p className="text-xs text-gray-500">Create, edit, deactivate staff accounts and assign roles</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Manage</button>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Home size={20} className="text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">Room management</p>
                      <p className="text-xs text-gray-500">Add/edit/archive rooms, set categories and pricing</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRoomModal(true)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Manage</button>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Tag size={20} className="text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800">Add-ons catalog</p>
                      <p className="text-xs text-gray-500">Manage billable add-ons: water sports, food, equipment</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">Manage</button>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Archive size={20} className="text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-800">Archived records</p>
                      <p className="text-xs text-gray-500">View and restore deleted guests, reservations, rooms</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">View</button>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-red-500" />
                    <div>
                      <p className="font-medium text-gray-800">Role permissions</p>
                      <p className="text-xs text-gray-500">Define what each role can view or modify per module</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">Configure</button>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-indigo-500" />
                    <div>
                      <p className="font-medium text-gray-800">Full reports access</p>
                      <p className="text-xs text-gray-500">All reports including audit logs and user activity</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600">View</button>
                </div>
              </div>
            </div>

            {/* Recent System Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-amber-500" />
                Recent system activity
              </h3>
              <div className="space-y-3">
                {systemData.recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-amber-500">
                    <p className="font-medium text-gray-800 text-sm">{activity.action}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{activity.role}</span>
                      <span className="text-xs text-gray-400">{activity.date} · {activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Server size={16} className="text-blue-600" />
                  <p className="font-medium text-blue-800 text-sm">System Health</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-gray-600">Database: Connected</span>
                  <span className="text-green-600">✓ Optimal</span>
                  <span className="text-gray-600">API Status: Online</span>
                  <span className="text-green-600">✓ Running</span>
                  <span className="text-gray-600">Storage: 45% used</span>
                  <span className="text-blue-600">ℹ Normal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm">Today's Check-ins</p>
                  <p className="text-3xl font-bold">{systemData.quickStats.checkIns}</p>
                </div>
                <CheckCircle size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm">Pending Check-outs</p>
                  <p className="text-3xl font-bold">{systemData.quickStats.checkOuts}</p>
                </div>
                <Clock size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm">Active Bookings</p>
                  <p className="text-3xl font-bold">{systemData.quickStats.active}</p>
                </div>
                <Calendar size={32} />
              </div>
            </div>
          </div>
        </>
      )
    }
    if (activeTab === 'users') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600">
              <Plus size={18} /> Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 font-semibold text-gray-600">Name</th>
                  <th className="p-3 font-semibold text-gray-600">Email</th>
                  <th className="p-3 font-semibold text-gray-600">Role</th>
                  <th className="p-3 font-semibold text-gray-600">Joined</th>
                  <th className="p-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.first_name} {user.last_name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'manager' ? 'bg-purple-100 text-purple-700' : user.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button className="text-blue-500 hover:text-blue-700 mr-3"><Edit size={16} /></button>
                      <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'addons') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add-ons Catalog</h2>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600">
              <Plus size={18} /> New Add-on
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addonsList.map(addon => (
              <div key={addon.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{addon.addon_name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${addon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {addon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">Code: {addon.addon_code}</p>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-lg font-bold text-amber-600">₱{addon.price}</p>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === 'activity') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">System Activity Logs</h2>
          <div className="space-y-4">
            {activityLogs.map(log => (
              <div key={log.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{log.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {log.user ? `${log.user.first_name} ${log.user.last_name} (${log.user.role})` : 'System'} · {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString()}</p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-3 border-b">
                    <p className="font-medium text-gray-800">{userData?.firstName} {userData?.lastName}</p>
                    <p className="text-xs text-gray-500">{userData?.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => navigate('/my-account')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
                    >
                      <User size={16} />
                      My Account
                    </button>
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="px-8 flex gap-6 border-b">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 text-sm font-medium transition-all ${
                activeTab === 'dashboard' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Room Management Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Home className="text-green-500" /> Room Management
              </h2>
              <button onClick={() => setShowRoomModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 border-r pr-6">
                <h3 className="font-bold text-lg mb-4">Add New Room</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room/Cottage Name or Number</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg" 
                      value={newRoom.room_number}
                      onChange={e => setNewRoom({...newRoom, room_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newRoom.category_id}
                      onChange={e => setNewRoom({...newRoom, category_id: e.target.value})}
                    >
                      <option value="1">Cottage</option>
                      <option value="2">Dormitory</option>
                      <option value="3">Single Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newRoom.status}
                      onChange={e => setNewRoom({...newRoom, status: e.target.value})}
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleAddRoom}
                    className="w-full py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                  >
                    Save Room
                  </button>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <h3 className="font-bold text-lg mb-4">Existing Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomsList.map(room => (
                    <div key={room.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{room.room_number}</p>
                        <p className="text-sm text-gray-500">{room.category?.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${room.status === 'available' ? 'bg-green-100 text-green-700' : room.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {room.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleToggleMaintenance(room.id, room.status)}
                        className={`text-sm px-3 py-1 rounded border ${room.status === 'maintenance' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                      >
                        {room.status === 'maintenance' ? 'Set Available' : 'Set Maintenance'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard