import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, Lock, 
  Save, X, Eye, EyeOff, CheckCircle, AlertCircle,
  Upload, Briefcase, Building, Globe, Edit2
} from 'lucide-react'
import api from '../api'

function MyAccount() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [userData, setUserData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: '',
    phone: '',
    address: '',
    city: '',
    hireDate: '',
    department: ''
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Load user data from localStorage (in real app, from API)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData({
      id: storedUser.id || '1',
      firstName: storedUser.firstName || 'Maria',
      lastName: storedUser.lastName || 'Santos',
      email: storedUser.email || 'maria.santos@costamarina.com',
      username: storedUser.username || 'maria.santos',
      role: storedUser.role || 'staff',
      phone: storedUser.phone || '+63 912 345 6789',
      address: storedUser.address || '123 Beach Road',
      city: storedUser.city || 'Samal City',
      hireDate: storedUser.hireDate || '2024-01-15',
      department: storedUser.department || 'Front Desk'
    })
    
    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem('userAvatar')
    if (savedAvatar) {
      setAvatarPreview(savedAvatar)
    }

    if (storedUser.role === 'guest') {
      fetchBookings()
    }
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch(e) {
      console.error(e);
    }
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      alert("Cancellation requested successfully!");
      fetchBookings();
    } catch (e) {
      alert("Failed to cancel booking.");
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        localStorage.setItem('userAvatar', reader.result)
        setSuccessMessage('Profile picture updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    // Validate
    const newErrors = {}
    if (!userData.firstName) newErrors.firstName = 'First name is required'
    if (!userData.lastName) newErrors.lastName = 'Last name is required'
    if (!userData.email) newErrors.email = 'Email is required'
    if (!userData.phone) newErrors.phone = 'Phone number is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Save to localStorage (in real app, API call)
    const updatedUser = { ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    setIsEditing(false)
    setSuccessMessage('Profile updated successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleChangePassword = () => {
    // Validate
    const newErrors = {}
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Simulate password change (in real app, API call)
    setSuccessMessage('Password changed successfully!')
    setShowPasswordModal(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getRoleBadge = () => {
    const roles = {
      staff: { color: 'bg-blue-100 text-blue-700', label: 'Front Desk Staff' },
      manager: { color: 'bg-purple-100 text-purple-700', label: 'Resort Manager' },
      admin: { color: 'bg-amber-100 text-amber-700', label: 'System Administrator' }
    }
    return roles[userData.role] || roles.staff
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto max-w-5xl px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            My Account
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full mt-2"></div>
          <p className="text-gray-600 mt-3">Manage your profile and account settings</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Role */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center sticky top-24">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-amber-500 rounded-full cursor-pointer hover:bg-amber-600 transition-all">
                  <Camera size={16} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mt-4">
                {userData.firstName} {userData.lastName}
              </h2>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${roleBadge.color}`}>
                {roleBadge.label}
              </div>
              <p className="text-sm text-gray-500 mt-3">@{userData.username}</p>
              
              <div className="border-t mt-6 pt-6">
                <div className="text-left space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} />
                    <span>{userData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building size={14} />
                    <span>{userData.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} />
                    <span>Hired: {userData.hireDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </>
                    ) : (
                      <p className="text-gray-800">{userData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Last Name *</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </>
                    ) : (
                      <p className="text-gray-800">{userData.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={userData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  ) : (
                    <p className="text-gray-800">{userData.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </>
                  ) : (
                    <p className="text-gray-800">{userData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-800">{userData.phone}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={userData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      />
                    ) : (
                      <p className="text-gray-800">{userData.address || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={userData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      />
                    ) : (
                      <p className="text-gray-800">{userData.city || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Change Button */}
              <div className="border-t mt-6 pt-6">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My Reservations Section (Newly Added) */}
        {userData.role === 'guest' && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar size={24} className="text-amber-500" />
              My Reservations
            </h3>
            
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-4">You have no reservations yet.</p>
                  <button 
                    onClick={() => navigate('/rooms')}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Book a Room Now
                  </button>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'cancellation_requested' ? 'bg-orange-100 text-orange-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">Booking #{booking.id}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mt-2">Room {booking.room?.room_number} ({booking.room?.category?.name})</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          {booking.check_in} to {booking.check_out}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xl font-bold text-amber-600">₱{parseFloat(booking.total_price).toFixed(2)}</div>
                        
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <button onClick={() => handleCancelBooking(booking.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAccount