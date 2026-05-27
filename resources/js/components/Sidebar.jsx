import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Calendar, UserPlus, Users, FileText, 
  AlertTriangle, CreditCard, Percent, FileBarChart, 
  Settings, Home, Bed, Package, Archive, Activity, 
  Shield, LogOut, CheckSquare, DollarSign, Clock
} from 'lucide-react'

function Sidebar({ role, onLogout }) {
  const location = useLocation()
  
  const staffMenu = [
    { path: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/staff/check-in', icon: Calendar, label: 'Check-in', badge: '5' },
    { path: '/staff/check-out', icon: LogOut, label: 'Check-out', badge: '2' },
    { path: '/staff/walk-in', icon: UserPlus, label: 'Walk-in registration' },
    { path: '/staff/reservations', icon: FileText, label: 'Reservations' },
    { path: '/staff/guests', icon: Users, label: 'Guests' },
    { path: '/staff/billing', icon: DollarSign, label: 'Billing' },
    { path: '/staff/compliance', icon: AlertTriangle, label: 'House rules log' },
  ]

  const managerMenu = [
    { path: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/manager/reservations', icon: Calendar, label: 'Reservations' },
    { path: '/manager/guests', icon: Users, label: 'Guests' },
    { path: '/manager/room-status', icon: Bed, label: 'Room status' },
    { path: '/manager/billing', icon: CreditCard, label: 'Billing & payments' },
    { path: '/manager/discounts', icon: Percent, label: 'Discount approvals', badge: '2' },
    { path: '/manager/reports', icon: FileBarChart, label: 'Reports' },
    { path: '/manager/compliance', icon: AlertTriangle, label: 'Compliance log' },
  ]

  const adminMenu = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User accounts' },
    { path: '/admin/rooms', icon: Bed, label: 'Room management' },
    { path: '/admin/addons', icon: Package, label: 'Add-ons catalog' },
    { path: '/admin/permissions', icon: Shield, label: 'Role permissions' },
    { path: '/admin/archived', icon: Archive, label: 'Archived records' },
    { path: '/admin/reports', icon: FileBarChart, label: 'All reports' },
    { path: '/admin/activity', icon: Activity, label: 'Activity log' },
  ]

  const menu = role === 'staff' ? staffMenu : role === 'manager' ? managerMenu : adminMenu
  const resortName = "Costa Marina Beach Resort"

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CoastaDesk</h1>
            <p className="text-xs text-gray-400">{resortName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Main</p>
        </div>
        {menu.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center justify-between px-6 py-3 mx-2 rounded-lg transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="font-semibold">User Name</p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar