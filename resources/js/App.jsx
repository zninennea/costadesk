import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { Menu, X, Home, Bed, Compass, Info, HelpCircle, Phone, Mail, Phone as PhoneIcon, MapPin, Waves, User, LogOut } from 'lucide-react'
import HomePage from './pages/HomePage'
import RoomsPage from './pages/RoomsPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StaffDashboard from './pages/dashboard/StaffDashboard'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import MyAccountPage from './pages/MyAccountPage'
import SettingsPage from './pages/SettingsPage'

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = localStorage.getItem('user')
  const userRole = localStorage.getItem('userRole')
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />
  }
  return children
}

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Check login status
    const user = localStorage.getItem('user')
    const role = localStorage.getItem('userRole')
    if (user) {
      setIsLoggedIn(true)
      setUserRole(role || '')
      try {
        const userData = JSON.parse(user)
        setUserName(userData.firstName || userData.username)
      } catch (e) {
        console.error('Error parsing user data', e)
      }
    }
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      // Call API if token exists
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      }
    } catch (e) {
      console.error('Logout error', e)
    } finally {
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('token')
      setIsLoggedIn(false)
      window.location.href = '/'
    }
  }

  // Don't show navbar on dashboard pages for staff/manager/admin
  const isDashboardPage = location.pathname.includes('/staff') || 
                          location.pathname.includes('/manager') || 
                          location.pathname.includes('/admin')
  
  if (isDashboardPage) {
    return null
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/rooms', label: 'Rooms', icon: Bed },
    { path: '/activities', label: 'Activities', icon: Compass },
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/faq', label: 'FAQ', icon: HelpCircle },
    { path: '/contact', label: 'Contact', icon: Phone }
  ]

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-md py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer md:absolute md:left-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg md:text-xl font-bold">🌊</span>
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Costa Marina
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">Beach Resort</p>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'text-amber-600 bg-amber-50' 
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Login/User Button */}
          <div className="flex items-center gap-3 md:absolute md:right-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Hi, {userName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300 text-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm">
                  <span>🔑</span>
                  Login
                </button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                  location.pathname === item.path 
                    ? 'text-amber-600 bg-amber-50' 
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <div className="px-4 py-2 text-gray-600 flex items-center gap-2">
                  <User size={20} />
                  <span>Hi, {userName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <span>🔑</span>
                  Login
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function Footer() {
  const location = useLocation()
  
  // Don't show footer on dashboard pages
  const isDashboardPage = location.pathname.includes('/staff') || 
                          location.pathname.includes('/manager') || 
                          location.pathname.includes('/admin')
  
  if (isDashboardPage) {
    return null
  }

  const quickLinks = [
    { label: 'Beach', icon: Waves, path: '/' },
    { label: 'Accommodations', icon: Bed, path: '/rooms' },
    { label: 'Activities', icon: Compass, path: '/activities' }
  ]

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🌊</span>
              </div>
              <h3 className="text-xl font-bold">CoastaDesk</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your premier front-desk management solution for an unforgettable beach resort experience.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-all duration-300">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-all duration-300">
                <span>📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-all duration-300">
                <span>🐦</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <link.icon size={14} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 flex-shrink-0" />
                <span>costamarinabeachresort@yahoo.com</span>
              </li>
              <li className="flex items-start gap-2">
                <PhoneIcon size={16} className="mt-0.5 flex-shrink-0" />
                <span>Globe: +639-177-958-372<br />Globe: +639-171-455-125<br />Smart: +639-190-080-827</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Km. 9, Sasa, Davao City</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Location</h4>
            <div className="bg-gray-800 rounded-lg h-40 flex items-center justify-center text-gray-500 text-sm">
              [Google Maps Embed Placeholder]
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 CoastaDesk - Costa Marina Beach Resort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-red-50">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
<Route path="/settings" element={<SettingsPage />} />
          
          {/* Staff Dashboard Routes */}
          <Route path="/staff/*" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          
          {/* Manager Dashboard Routes */}
          <Route path="/manager/*" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Public Routes with Navbar and Footer */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App