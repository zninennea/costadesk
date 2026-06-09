import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Calendar, LogOut, User, Settings,
  Home, Plus, FileText, AlertCircle, Shield, Database,
  HardDrive, Tag, Server, Activity, Bell, UserPlus,
  Edit, Archive, Trash2, Key, CheckCircle, XCircle, Clock, CreditCard
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api'
import { getRoomStatusColor } from '../../utils/statusColors'
import UserModal from '../../components/UserModal'
import RoomModal from '../../components/RoomModal'
import ReportsView from '../../components/ReportsView'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const formatCurrency = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '₱0.00' : `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const safeFormatAmount = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

function AdminDashboard() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [categoriesList, setCategoriesList] = useState([])
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [roomsList, setRoomsList] = useState([])
  const [usersList, setUsersList] = useState([])
  const [addonsList, setAddonsList] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [editingAddon, setEditingAddon] = useState(null)
  const [newAddon, setNewAddon] = useState({ addon_code: '', addon_name: '', addon_type: 'other', price: 0, price_type: 'fixed', is_active: true })
  const [bookingsList, setBookingsList] = useState([])

  const [guestsList, setGuestsList] = useState([])
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [blacklistReason, setBlacklistReason] = useState('')

  const [billsList, setBillsList] = useState([])
  const [selectedBill, setSelectedBill] = useState(null)
  const [showBillDetailModal, setShowBillDetailModal] = useState(false)
  const [billingSearchQuery, setBillingSearchQuery] = useState('')

  const [permissionsMatrix, setPermissionsMatrix] = useState([])
  const [activePermissionRole, setActivePermissionRole] = useState('staff')

  const [archivedData, setArchivedData] = useState({ users: [], rooms: [], bookings: [], guests: [] })
  const [archiveActiveTab, setArchiveActiveTab] = useState('users')

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
      const categoriesRes = await api.get('/rooms/categories');

      const users = usersRes.data;
      const rooms = roomsRes.data;
      const bookings = bookingsRes.data;

      setRoomsList(rooms);
      setBookingsList(bookings);
      setCategoriesList(categoriesRes.data);

      const staffUsers = users.filter(u => u.role !== 'guest');
      const guestUsers = users.filter(u => u.role === 'guest');

      setUsersList(users);

      const guestsRes = await api.get('/guests').catch(() => ({ data: [] }));
      setGuestsList(guestsRes.data);

      const billsRes = await api.get('/bills').catch(() => ({ data: [] }));
      setBillsList(billsRes.data);

      const permissionsRes = await api.get('/role-permissions').catch(() => ({ data: [] }));
      setPermissionsMatrix(permissionsRes.data);

      const archivesRes = await api.get('/archives').catch(() => ({ data: { users: [], rooms: [], bookings: [], guests: [] } }));
      setArchivedData(archivesRes.data);

      const addonsRes = await api.get('/addons?all=true').catch(() => ({ data: [] }));
      setAddonsList(addonsRes.data);

      const logsRes = await api.get('/reports/activity-logs').catch(() => ({ data: [] }));
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

    } catch (e) {
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

  const handleSaveUser = async (data) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data)
        alert('User updated successfully!')
      } else {
        await api.post('/users', data)
        alert('User created successfully!')
      }
      setShowUserModal(false)
      fetchData()
    } catch (e) {
      if (e.response?.data?.errors) {
        const errorMsg = Object.values(e.response.data.errors).flat().join('\n')
        alert('Validation Error:\n' + errorMsg)
      } else {
        alert(editingUser ? 'Failed to update user.' : 'Failed to create user.')
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleSaveRoom = async (data) => {
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, data)
        alert('Room updated successfully!')
      } else {
        await api.post('/rooms', data)
        alert('Room created successfully!')
      }
      setShowRoomModal(false)
      fetchData()
    } catch (e) {
      if (e.response?.data?.errors) {
        const errorMsg = Object.values(e.response.data.errors).flat().join('\n')
        alert('Validation Error:\n' + errorMsg)
      } else {
        alert(editingRoom ? 'Failed to update room.' : 'Failed to create room.')
      }
    }
  };

  const handleSaveAddon = async (e) => {
    e.preventDefault();
    try {
      if (editingAddon) {
        await api.put(`/addons/${editingAddon.id}`, newAddon);
        alert('Add-on updated successfully');
      } else {
        await api.post('/addons', newAddon);
        alert('Add-on created successfully');
      }
      setShowAddonModal(false);
      setEditingAddon(null);
      setNewAddon({ addon_code: '', addon_name: '', addon_type: 'other', price: 0, price_type: 'fixed', is_active: true });
      fetchData();
    } catch (err) {
      alert('Failed to save add-on. Please check inputs.');
    }
  };

  const handleDeleteAddon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this add-on?')) return;
    try {
      await api.delete(`/addons/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete add-on.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-30 overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br bg-primary rounded-xl flex items-center justify-center">
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
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Operations</div>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reservations' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Calendar size={18} />
          Reservations
        </button>
        <button
          onClick={() => setActiveTab('guests')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Users size={18} />
          Guests
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'billing' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <CreditCard size={18} />
          Billing & payments
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">System Config</div>
        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Users size={18} />
          User accounts
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Home size={18} />
          Room management
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'addons' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Tag size={18} />
          Add-ons catalog
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'roles' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Shield size={18} />
          Role permissions
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Data</div>
        <button
          onClick={() => setActiveTab('archives')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'archives' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Archive size={18} />
          Archived records
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <FileText size={18} />
          All reports
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'activity' ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Activity size={18} />
          Activity log
        </button>
      </nav>
    </div>
  )

  const handleConfirmBooking = async (id) => {
    try {
      // Update booking status to confirmed
      await api.put(`/bookings/${id}`, { status: 'confirmed' });
      alert("Booking confirmed successfully.");

      // Also update the room status if needed
      const booking = bookingsList.find(b => b.id === id);
      if (booking && booking.room_id) {
        await api.put(`/rooms/${booking.room_id}`, { status: 'reserved' });
      }

      fetchData();
    } catch (e) {
      console.error('Failed to confirm booking:', e);
      alert("Failed to confirm booking.");
    }
  };

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

  const handleRestoreArchive = async (type, id) => {
    if (!window.confirm(`Are you sure you want to restore this ${type}?`)) return;
    try {
      await api.post('/archives/restore', { type, id });
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} restored successfully!`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to restore archived item');
    }
  };

  const handleSavePermissions = async () => {
    try {
      const payload = permissionsMatrix.map(p => ({
        role: p.role,
        module: p.module,
        can_read: p.can_read ? 1 : 0,
        can_write: p.can_write ? 1 : 0
      }));
      await api.post('/role-permissions', { permissions: payload });
      alert('Permissions updated successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save permissions');
    }
  };

  const handlePermissionChange = (role, module, field, value) => {
    setPermissionsMatrix(prev => {
      const existsIndex = prev.findIndex(p => p.role === role && p.module === module);
      if (existsIndex > -1) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], [field]: value };
        return updated;
      } else {
        return [...prev, { role, module, can_read: field === 'can_read' ? value : false, can_write: field === 'can_write' ? value : false }];
      }
    });
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-secondary" />
              Report Date Range
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-secondary">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Active staff accounts</p>
                  <p className="text-3xl font-bold text-gray-800">{systemData.staff.total}</p>
                  <p className="text-sm text-gray-500 mt-1">{systemData.staff.frontDesk} front desk, {systemData.staff.manager} manager</p>
                </div>
                <Users size={32} className="text-secondary" />
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

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Add-on items</p>
                  <p className="text-3xl font-bold text-gray-800">{systemData.addOns.total}</p>
                  <p className="text-sm text-gray-500 mt-1">Across {systemData.addOns.categories} categories</p>
                </div>
                <Tag size={32} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Admin access areas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UserPlus size={20} className="text-secondary" />
                    <div>
                      <p className="font-medium text-gray-800">User management</p>
                      <p className="text-xs text-gray-500">Create, edit, deactivate staff accounts and assign roles</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('users')} className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-secondary">Manage</button>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Home size={20} className="text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">Room management</p>
                      <p className="text-xs text-gray-500">Add/edit/archive rooms, set categories and pricing</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('rooms')} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">Manage</button>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Tag size={20} className="text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800">Add-ons catalog</p>
                      <p className="text-xs text-gray-500">Manage billable add-ons: water sports, food, equipment</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('addons')} className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">Manage</button>
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

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Recent system activity
              </h3>
              <div className="space-y-3">
                {systemData.recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-primary">
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
                  <Server size={16} className="text-secondary" />
                  <p className="font-medium text-blue-800 text-sm">System Health</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-gray-600">Database: Connected</span>
                  <span className="text-green-600">✓ Optimal</span>
                  <span className="text-gray-600">API Status: Online</span>
                  <span className="text-green-600">✓ Running</span>
                  <span className="text-gray-600">Storage: 45% used</span>
                  <span className="text-secondary">ℹ Normal</span>
                </div>
              </div>
            </div>
          </div>

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
            <button
              onClick={() => {
                setEditingUser(null);
                setShowUserModal(true);
              }}
              className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center gap-2 hover:bg-secondary"
            >
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
                  <th className="p-3 font-semibold text-gray-600">Status</th>
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
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setShowUserModal(true)
                        }}
                        className="text-primary hover:text-primary-light mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'rooms') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Room Management</h2>
            <button
              onClick={() => {
                setEditingRoom(null);
                setShowRoomModal(true);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
              <Plus size={18} /> Add Room
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomsList.map(room => (
              <div key={room.id} className="border p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{room.room_number}</h4>
                  <p className="text-sm text-gray-500">{room.category?.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border uppercase tracking-wider font-semibold ${getRoomStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingRoom(room)
                    setShowRoomModal(true)
                  }}
                  className="text-primary hover:text-primary-light"
                >
                  <Edit size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
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
                  <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-primary">{booking.booking_code || `CMB-${booking.id}`}</td>
                    <td className="p-3">{booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : 'Walk-in/Guest'}</td>
                    <td className="p-3">Room {booking.room?.room_number}</td>
                    <td className="p-3 text-sm">{booking.check_in} to {booking.check_out}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${booking.status === 'confirmed' || booking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'checked_out' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-right">₱{(booking.total_price || 0).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      {booking.status === 'pending' && (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Confirm Booking"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="Cancel Booking"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
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
            <button
              onClick={() => {
                setEditingAddon(null);
                setNewAddon({ addon_code: '', addon_name: '', addon_type: 'other', price: 0, price_type: 'fixed', is_active: true });
                setShowAddonModal(true);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
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
                  <p className="text-lg font-bold text-primary">₱{addon.price}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAddon(addon);
                        setNewAddon(addon);
                        setShowAddonModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-secondary bg-gray-50 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddon(addon.id)}
                      className="p-2 text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
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
                <div className="w-10 h-10 rounded-full bg-amber-100 text-primary flex items-center justify-center shrink-0">
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
                {guestsList.map(guest => (
                  <tr key={guest.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{guest.first_name} {guest.last_name}</td>
                    <td className="p-3">{guest.email || 'N/A'}</td>
                    <td className="p-3">{guest.mobile || guest.phone || 'N/A'}</td>
                    <td className="p-3">{guest.city}, {guest.country}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'billing') {
      const filteredBills = (billsList || []).filter(bill => {
        if (!bill) return false;
        const query = (billingSearchQuery || '').toLowerCase();
        const guestName = `${bill.booking?.guest?.first_name || ''} ${bill.booking?.guest?.last_name || ''}`.toLowerCase();
        const code = (bill.booking?.booking_code || '').toLowerCase();
        const invoiceNum = (bill.bill_number || '').toLowerCase();
        return guestName.includes(query) || code.includes(query) || invoiceNum.includes(query);
      });

      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Billing & Invoices</h2>
            <input
              type="text"
              placeholder="Search by Guest, Booking Code, Invoice..."
              className="border rounded-lg px-4 py-2 text-sm w-80 outline-none focus:ring-2 focus:ring-primary"
              value={billingSearchQuery}
              onChange={(e) => setBillingSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 font-semibold text-gray-600">Invoice Number</th>
                  <th className="p-3 font-semibold text-gray-600">Booking Code</th>
                  <th className="p-3 font-semibold text-gray-600">Guest</th>
                  <th className="p-3 font-semibold text-gray-600">Room</th>
                  <th className="p-3 font-semibold text-gray-600">Total Amount</th>
                  <th className="p-3 font-semibold text-gray-600">Paid Amount</th>
                  <th className="p-3 font-semibold text-gray-600">Balance</th>
                  <th className="p-3 font-semibold text-gray-600">Status</th>
                  <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => {
                  if (!bill) return null;
                  const total = parseFloat(bill.total_amount) || 0;
                  const paid = parseFloat(bill.paid_amount) || 0;
                  const balance = parseFloat(bill.balance_due) || 0;

                  return (
                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-primary">{bill.bill_number || 'N/A'}</td>
                      <td className="p-3">{bill.booking?.booking_code || 'N/A'}</td>
                      <td className="p-3">{bill.booking?.guest ? `${bill.booking.guest.first_name} ${bill.booking.guest.last_name}` : 'N/A'}</td>
                      <td className="p-3">Room {bill.booking?.room?.room_number || 'N/A'}</td>
                      <td className="p-3">₱{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-3">₱{paid.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-3 font-semibold text-red-600">₱{balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                          bill.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bill.status || 'draft'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={async () => {
                          try {
                            const res = await api.get(`/bills/${bill.id}`);
                            setSelectedBill(res.data);
                            setShowBillDetailModal(true);
                          } catch (err) {
                            alert('Failed to load bill details');
                          }
                        }}
                        className="p-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 text-xs font-semibold px-2 py-1"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'roles') {
      const modules = [
        { key: 'dashboard', name: 'Main Dashboard' },
        { key: 'rooms', name: 'Room Management' },
        { key: 'bookings', name: 'Bookings & Reservations' },
        { key: 'billing', name: 'Billing & Payments' },
        { key: 'addons', name: 'Add-ons Catalog' },
        { key: 'violations', name: 'Guest Violations' },
        { key: 'logs', name: 'System Logs & Reports' }
      ];

      const rolesList = [
        { key: 'staff', name: 'Front Desk Staff' },
        { key: 'manager', name: 'Resort Manager' },
        { key: 'admin', name: 'System Administrator' },
        { key: 'guest', name: 'Online Guest' }
      ];

      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Role Permissions Configurations</h2>
              <p className="text-sm text-gray-500 mt-1">Configure module read/write rights per system role</p>
            </div>
            <button
              onClick={handleSavePermissions}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition font-semibold shadow"
            >
              Save Permissions Matrix
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            {rolesList.map(r => (
              <button
                key={r.key}
                onClick={() => setActivePermissionRole(r.key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activePermissionRole === r.key 
                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-500 shadow-sm' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold text-gray-700">Module Access Area</th>
                  <th className="p-4 font-semibold text-gray-700 text-center">Read Rights</th>
                  <th className="p-4 font-semibold text-gray-700 text-center">Write/Modify Rights</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(mod => {
                  const perm = permissionsMatrix.find(p => p.role === activePermissionRole && p.module === mod.key) || { can_read: false, can_write: false };
                  return (
                    <tr key={mod.key} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-800">{mod.name}</td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={!!perm.can_read}
                          onChange={(e) => handlePermissionChange(activePermissionRole, mod.key, 'can_read', e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={!!perm.can_write}
                          onChange={(e) => handlePermissionChange(activePermissionRole, mod.key, 'can_write', e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'archives') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Archived Records Vault</h2>
            <p className="text-sm text-gray-500 mt-1">Review and restore soft-deleted profiles or records</p>
          </div>

          <div className="flex gap-4 mb-6 border-b pb-2">
            {['users', 'rooms', 'bookings', 'guests'].map(tab => (
              <button
                key={tab}
                onClick={() => setArchiveActiveTab(tab)}
                className={`pb-2 px-4 font-medium capitalize border-b-2 transition ${
                  archiveActiveTab === tab
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {archiveActiveTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-3 font-semibold text-gray-600">Name</th>
                    <th className="p-3 font-semibold text-gray-600">Email</th>
                    <th className="p-3 font-semibold text-gray-600">Role</th>
                    <th className="p-3 font-semibold text-gray-600">Deleted At</th>
                    <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedData.users.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">No deleted user records found.</td></tr>
                  ) : archivedData.users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{u.first_name} {u.last_name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3 capitalize">{u.role}</td>
                      <td className="p-3">{new Date(u.deleted_at).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestoreArchive('user', u.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {archiveActiveTab === 'rooms' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-3 font-semibold text-gray-600">Room Number</th>
                    <th className="p-3 font-semibold text-gray-600">Category</th>
                    <th className="p-3 font-semibold text-gray-600">Price</th>
                    <th className="p-3 font-semibold text-gray-600">Deleted At</th>
                    <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedData.rooms.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">No deleted room records found.</td></tr>
                  ) : archivedData.rooms.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-bold">{r.room_number}</td>
                      <td className="p-3">{r.category?.name || 'N/A'}</td>
                      <td className="p-3">₱{parseFloat(r.price).toLocaleString()}</td>
                      <td className="p-3">{new Date(r.deleted_at).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestoreArchive('room', r.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {archiveActiveTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-3 font-semibold text-gray-600">Booking Code</th>
                    <th className="p-3 font-semibold text-gray-600">Guest</th>
                    <th className="p-3 font-semibold text-gray-600">Room</th>
                    <th className="p-3 font-semibold text-gray-600">Schedule</th>
                    <th className="p-3 font-semibold text-gray-600">Deleted At</th>
                    <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedData.bookings.length === 0 ? (
                    <tr><td colSpan="6" className="p-4 text-center text-gray-400">No deleted booking records found.</td></tr>
                  ) : archivedData.bookings.map(b => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-primary">{b.booking_code}</td>
                      <td className="p-3">{b.guest ? `${b.guest.first_name} ${b.guest.last_name}` : 'N/A'}</td>
                      <td className="p-3">Room {b.room?.room_number || 'N/A'}</td>
                      <td className="p-3 text-xs">{b.check_in} to {b.check_out}</td>
                      <td className="p-3">{new Date(b.deleted_at).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestoreArchive('booking', b.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {archiveActiveTab === 'guests' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-3 font-semibold text-gray-600">Guest Name</th>
                    <th className="p-3 font-semibold text-gray-600">Email</th>
                    <th className="p-3 font-semibold text-gray-600">Mobile</th>
                    <th className="p-3 font-semibold text-gray-600">Deleted At</th>
                    <th className="p-3 font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedData.guests.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">No deleted guest records found.</td></tr>
                  ) : archivedData.guests.map(g => (
                    <tr key={g.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{g.first_name} {g.last_name}</td>
                      <td className="p-3">{g.email || 'N/A'}</td>
                      <td className="p-3">{g.mobile || 'N/A'}</td>
                      <td className="p-3">{new Date(g.deleted_at).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestoreArchive('guest', g.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'reports') {
      return <ReportsView />
    }

    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{activeTab}</h2>
        <p className="text-gray-500 mb-6">This section is currently under development.</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
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
                <div className="w-10 h-10 bg-gradient-to-br bg-primary rounded-full flex items-center justify-center">
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
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSave={handleSaveRoom}
        room={editingRoom}
        categories={categoriesList}
      />

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleSaveUser}
        user={editingUser}
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

      {/* Invoice Details Modal */}
      {showBillDetailModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
              <button onClick={() => setShowBillDetailModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Invoice:</span><span className="font-bold">{selectedBill.bill_number || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Guest:</span><span>{selectedBill.booking?.guest ? `${selectedBill.booking.guest.first_name} ${selectedBill.booking.guest.last_name}` : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Room:</span><span>{selectedBill.booking?.room?.room_number ? `Room ${selectedBill.booking.room.room_number} (${selectedBill.booking.room.category?.name || 'Standard'})` : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Schedule:</span><span>{selectedBill.booking ? `${selectedBill.booking.check_in} to ${selectedBill.booking.check_out}` : 'N/A'}</span></div>
            </div>

            <h3 className="font-bold text-gray-800 text-sm mb-2">Itemized Charges</h3>
            <div className="border rounded-lg overflow-hidden mb-4 text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2.5">Room Stay Charge</td>
                    <td className="p-2.5 text-right">₱{safeFormatAmount(selectedBill.room_charge)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2.5">Add-ons Total</td>
                    <td className="p-2.5 text-right">₱{safeFormatAmount(selectedBill.addons_charge || selectedBill.addons_total)}</td>
                  </tr>
                  {parseFloat(selectedBill.discount_amount || selectedBill.discount_total || 0) > 0 && (
                    <tr className="border-b text-green-600">
                      <td className="p-2.5">Discounts Applied</td>
                      <td className="p-2.5 text-right">-₱{safeFormatAmount(selectedBill.discount_amount || selectedBill.discount_total)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-bold">
                    <td className="p-2.5">Total Amount Due</td>
                    <td className="p-2.5 text-right">₱{safeFormatAmount(selectedBill.total_amount)}</td>
                  </tr>
                  <tr className="bg-green-50 text-green-800 font-semibold">
                    <td className="p-2.5">Paid Amount</td>
                    <td className="p-2.5 text-right">₱{safeFormatAmount(selectedBill.paid_amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-gray-800 text-sm mb-2">Transaction History</h3>
            <div className="border rounded-lg overflow-hidden mb-6 text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedBill.payments || selectedBill.payments.length === 0 ? (
                    <tr><td colSpan="3" className="p-2.5 text-center text-gray-400">No payments processed.</td></tr>
                  ) : selectedBill.payments.map(pay => (
                    <tr key={pay.id} className="border-b">
                      <td className="p-2.5 text-xs">{new Date(pay.created_at || pay.payment_datetime).toLocaleString()}</td>
                      <td className="p-2.5 capitalize">{pay.method}</td>
                      <td className="p-2.5 text-right font-medium">₱{safeFormatAmount(pay.amount_paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(20);
                  doc.text("Costa Marina Beach Resort Invoice", 14, 22);
                  doc.setFontSize(10);
                  doc.text(`Invoice: ${selectedBill.bill_number || 'N/A'}`, 14, 30);
                  doc.text(`Booking: ${selectedBill.booking?.booking_code || 'N/A'}`, 14, 36);
                  doc.text(`Guest: ${selectedBill.booking?.guest ? `${selectedBill.booking.guest.first_name} ${selectedBill.booking.guest.last_name}` : 'N/A'}`, 14, 42);
                  
                  const tableRows = [
                    ["Room Stay Charge", `Php ${safeFormatAmount(selectedBill.room_charge)}`],
                    ["Add-ons Total", `Php ${safeFormatAmount(selectedBill.addons_charge || selectedBill.addons_total)}`],
                    ["Discounts Applied", `-Php ${safeFormatAmount(selectedBill.discount_amount || selectedBill.discount_total)}`],
                    ["Total Amount Due", `Php ${safeFormatAmount(selectedBill.total_amount)}`],
                    ["Paid Amount", `Php ${safeFormatAmount(selectedBill.paid_amount)}`],
                    ["Outstanding Balance", `Php ${safeFormatAmount(selectedBill.balance_due)}`]
                  ];
                  doc.autoTable({
                    startY: 50,
                    head: [['Description', 'Value']],
                    body: tableRows,
                    theme: 'grid',
                    headStyles: { fillColor: [245, 158, 11] }
                  });
                  doc.save(`Invoice_${selectedBill.bill_number}.pdf`);
                }}
                className="flex-1 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
              >
                Print PDF Invoice
              </button>
              <button
                type="button"
                onClick={() => setShowBillDetailModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />

      {/* Addon Modal */}
      {showAddonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editingAddon ? 'Edit Add-on' : 'New Add-on'}</h2>
              <button onClick={() => setShowAddonModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddon} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Code</label>
                  <input type="text" required value={newAddon.addon_code} onChange={e => setNewAddon({ ...newAddon, addon_code: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Name</label>
                  <input type="text" required value={newAddon.addon_name} onChange={e => setNewAddon({ ...newAddon, addon_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Type</label>
                  <select value={newAddon.addon_type} onChange={e => setNewAddon({ ...newAddon, addon_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="food_beverage">Food & Beverage</option>
                    <option value="water_sports">Water Sports</option>
                    <option value="equipment">Equipment</option>
                    <option value="transport">Transport</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Price</label>
                  <input type="number" required value={newAddon.price} onChange={e => setNewAddon({ ...newAddon, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Price Type</label>
                  <select value={newAddon.price_type} onChange={e => setNewAddon({ ...newAddon, price_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="fixed">Fixed</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="per_day">Per Day</option>
                    <option value="per_person">Per Person</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <input type="checkbox" id="is_active" checked={newAddon.is_active} onChange={e => setNewAddon({ ...newAddon, is_active: e.target.checked })} className="mr-2" />
                  <label htmlFor="is_active" className="text-gray-700 font-medium">Is Active</label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  {editingAddon ? 'Update Add-on' : 'Save Add-on'}
                </button>
                <button type="button" onClick={() => setShowAddonModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
