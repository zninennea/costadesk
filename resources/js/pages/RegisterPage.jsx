import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, MapPin, Home, Building, Globe, Phone, CheckCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import api from '../api'

function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    unitBlkFlr: '',
    street: '',
    city: '',
    province: '',
    zipCode: '',
    country: 'Philippines',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.province.trim()) newErrors.province = 'Province is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms & Policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const response = await api.post('/register', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      })

      // Show success message and redirect to login
      alert('Registration successful! Please login with your new account.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      if (err.response && err.response.status === 422) {
        // Validation errors from Laravel
        const backendErrors = err.response.data.errors || {}
        const newErrors = { ...errors }
        if (backendErrors.email) newErrors.email = backendErrors.email[0]
        if (backendErrors.password) newErrors.password = backendErrors.password[0]
        setErrors({ ...newErrors, general: err.response.data.message || 'Validation failed' })
      } else {
        setErrors({ ...errors, general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with Image Placeholder */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 to-orange-900/80 z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center" 
             style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200)' }}>
          {/* REPLACE WITH YOUR ACTUAL RESORT IMAGE */}
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-12 text-center w-full">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-2xl">
              <span className="text-6xl">🌊</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Costa Marina</h1>
            <p className="text-xl">Beach Resort</p>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
            <p className="text-white/90 text-lg">
              "Create your account and start planning your perfect beach getaway"
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-white/70">
              <span>✓ Best Price Guarantee</span>
              <span>✓ Easy Booking</span>
              <span>✓ 24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-white overflow-y-auto">
        <div className="max-w-lg w-full py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 text-sm">Join us for an unforgettable experience</p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-500 mt-2">Fill in your details to get started</p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information Section */}
            <div className="bg-amber-50/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User size={18} className="text-amber-600" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="First name"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                    placeholder="Middle name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-amber-50/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-amber-600" />
                Address Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="House/Unit number and Street name"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">Unit/Blk/Flr</label>
                    <input
                      type="text"
                      name="unitBlkFlr"
                      value={formData.unitBlkFlr}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                      placeholder="Unit/Block/Floor"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">Street/House Number</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                      placeholder="Street name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Province"
                    />
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      ZIP/Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="ZIP code"
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Country"
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-amber-50/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Lock size={18} className="text-amber-600" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Choose a username"
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    Password <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Must at least 8 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-amber-600 hover:underline">Terms & Policy</a> and 
                confirm that I have read the <a href="#" className="text-amber-600 hover:underline">Privacy Policy</a>.
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage