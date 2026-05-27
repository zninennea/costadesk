import { useState, useEffect } from 'react'
import { 
  Sun, Moon, Bell, Mail, Phone, Globe, Shield, 
  Eye, EyeOff, Volume2, VolumeX, Monitor, Smartphone,
  Save, CheckCircle, AlertCircle, Accessibility, Type,
  Contrast, ZoomIn, ZoomOut
} from 'lucide-react'

function Settings() {
  const [settings, setSettings] = useState({
    // Display Settings
    theme: 'light',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingAlerts: true,
    checkoutAlerts: true,
    maintenanceAlerts: false,
    
    // Accessibility Settings
    screenReaderOptimized: false,
    largeButtons: false,
    keyboardNavigation: true,
    voiceCommands: false,
    
    // Privacy Settings
    showOnlineStatus: true,
    twoFactorAuth: false,
    sessionTimeout: 30
  })
  
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('display')

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    // Apply theme immediately
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'display', label: 'Display & Theme', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto max-w-5xl px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full mt-2"></div>
          <p className="text-gray-600 mt-3">Customize your application preferences</p>
        </div>

        {/* Saved Confirmation */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            Settings saved successfully!
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-2 sticky top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Display Settings */}
              {activeTab === 'display' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Display & Theme</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => updateSetting('theme', 'light')}
                          className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                            settings.theme === 'light' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Sun size={24} className={settings.theme === 'light' ? 'text-amber-500' : 'text-gray-400'} />
                          <span className="text-sm">Light</span>
                        </button>
                        <button
                          onClick={() => updateSetting('theme', 'dark')}
                          className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                            settings.theme === 'dark' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Moon size={24} className={settings.theme === 'dark' ? 'text-amber-500' : 'text-gray-400'} />
                          <span className="text-sm">Dark</span>
                        </button>
                        <button
                          onClick={() => updateSetting('theme', 'system')}
                          className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                            settings.theme === 'system' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Monitor size={24} className={settings.theme === 'system' ? 'text-amber-500' : 'text-gray-400'} />
                          <span className="text-sm">System</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-3">Font Size</label>
                      <div className="flex gap-3">
                        {['small', 'medium', 'large', 'xlarge'].map(size => (
                          <button
                            key={size}
                            onClick={() => updateSetting('fontSize', size)}
                            className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                              settings.fontSize === size
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Contrast size={20} className="text-gray-600" />
                          <span>High Contrast Mode</span>
                        </div>
                        <button
                          onClick={() => updateSetting('highContrast', !settings.highContrast)}
                          className={`w-12 h-6 rounded-full transition-all ${
                            settings.highContrast ? 'bg-amber-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                            settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <ZoomOut size={20} className="text-gray-600" />
                          <span>Reduced Motion</span>
                        </div>
                        <button
                          onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                          className={`w-12 h-6 rounded-full transition-all ${
                            settings.reducedMotion ? 'bg-amber-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                            settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Notifications</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Mail size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive updates via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.emailNotifications ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Phone size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive text message updates</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('smsNotifications', !settings.smsNotifications)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.smsNotifications ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.smsNotifications ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Bell size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-500">Browser notifications</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.pushNotifications ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <div className="border-t pt-4 mt-4">
                      <p className="font-medium text-gray-700 mb-3">Alert Preferences</p>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>New Booking Alerts</span>
                          <button
                            onClick={() => updateSetting('bookingAlerts', !settings.bookingAlerts)}
                            className={`w-12 h-6 rounded-full transition-all ${
                              settings.bookingAlerts ? 'bg-amber-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                              settings.bookingAlerts ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </label>
                        
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>Check-out Reminders</span>
                          <button
                            onClick={() => updateSetting('checkoutAlerts', !settings.checkoutAlerts)}
                            className={`w-12 h-6 rounded-full transition-all ${
                              settings.checkoutAlerts ? 'bg-amber-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                              settings.checkoutAlerts ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Accessibility Features</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Type size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Screen Reader Optimized</p>
                          <p className="text-sm text-gray-500">Optimize for screen readers</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('screenReaderOptimized', !settings.screenReaderOptimized)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.screenReaderOptimized ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.screenReaderOptimized ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <ZoomIn size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Large Buttons Mode</p>
                          <p className="text-sm text-gray-500">Increase button size for easier clicking</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('largeButtons', !settings.largeButtons)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.largeButtons ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.largeButtons ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Keyboard size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Keyboard Navigation</p>
                          <p className="text-sm text-gray-500">Enhanced keyboard shortcuts</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.keyboardNavigation ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Accessibility size={18} className="text-blue-600" />
                        <p className="font-medium text-blue-800">Accessibility Support</p>
                      </div>
                      <p className="text-sm text-blue-700">
                        Need additional accessibility support? Contact our IT department for personalized assistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Privacy & Security</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Eye size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Show Online Status</p>
                          <p className="text-sm text-gray-500">Let others see when you're active</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('showOnlineStatus', !settings.showOnlineStatus)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.showOnlineStatus ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Shield size={20} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
                        className={`w-12 h-6 rounded-full transition-all ${
                          settings.twoFactorAuth ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${
                          settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Session Timeout (minutes)</label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={0}>Never</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Auto logout after inactivity</p>
                    </div>
                  </div>

                  <div className="border-t mt-6 pt-6">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700 font-medium mb-2">⚠️ Security Notice</p>
                      <p className="text-sm text-red-600">
                        For security reasons, never share your password with anyone. 
                        Costa Marina staff will never ask for your password.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t mt-8 pt-6">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Save size={18} />
                  Save All Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for keyboard icon
const Keyboard = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
    <line x1="8" y1="10" x2="8" y2="14"></line>
    <line x1="12" y1="10" x2="12" y2="14"></line>
    <line x1="16" y1="10" x2="16" y2="14"></line>
    <line x1="6" y1="10" x2="10" y2="10"></line>
    <line x1="14" y1="10" x2="18" y2="10"></line>
    <line x1="6" y1="14" x2="10" y2="14"></line>
    <line x1="14" y1="14" x2="18" y2="14"></line>
  </svg>
)

export default Settings