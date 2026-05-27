import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, LogIn } from 'lucide-react'
import api from '../api'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sampleUsers = [
  { email: 'staff@costadesk.com', username: 'staff', password: 'password', firstName: 'Staff', lastName: 'User', role: 'staff' },
  { email: 'manager@costadesk.com', username: 'manager', password: 'password', firstName: 'Manager', lastName: 'User', role: 'manager' },
  { email: 'admin@costadesk.com', username: 'admin', password: 'password', firstName: 'Admin', lastName: 'User', role: 'admin' }
]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/login', {
        email: loginData.emailOrUsername,
        password: loginData.password
      })

      const { user, access_token } = response.data

      // Store token and user info
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify({ 
        email: user.email, 
        username: user.first_name, // Using first_name as username fallback for UI
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }))
      localStorage.setItem('userRole', user.role)
      
      // Redirect based on role
      switch(user.role) {
        case 'staff':
          navigate('/staff/dashboard')
          break
        case 'manager':
          navigate('/manager/dashboard')
          break
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'guest':
        default:
          navigate(location.state?.returnTo || '/my-account')
          break
      }
    } catch (err) {
      console.error(err)
      if (err.response && err.response.status === 422) {
        setError('Invalid email or password')
      } else {
        setError('Something went wrong. Please try again.')
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
             style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200)' }}>
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
              "Your premier beach resort destination in Samal Island"
            </p>
            <div className="flex justify-center gap-2 text-sm text-white/70">
              <span>✦ DOT Accredited</span>
              <span>✦ Premium Service</span>
              <span>✦ Tropical Paradise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-500">Sign in to continue</p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2">Please sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email or Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="emailOrUsername"
                  value={loginData.emailOrUsername}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                  placeholder="Enter your email or username"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-amber-600 font-semibold hover:text-amber-700 hover:underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center font-semibold mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">👤 <span className="font-medium">Guest:</span> guest@costadesk.com / password</p>
              <p className="text-gray-600">👤 <span className="font-medium">Staff:</span> staff@costadesk.com / password</p>
              <p className="text-gray-600">👤 <span className="font-medium">Manager:</span> manager@costadesk.com / password</p>
              <p className="text-gray-600">👤 <span className="font-medium">Admin:</span> admin@costadesk.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage