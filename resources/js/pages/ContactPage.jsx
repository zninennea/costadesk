import { useState } from 'react'
import { Mail, Phone as PhoneIcon, MapPin } from 'lucide-react'

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in your name, email, and message.");
      return;
    }
    
    // Simulate API call
    alert("Thank you, " + formData.name + "! Your message has been sent to our team. We will get back to you shortly.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 pt-24">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">We'd love to hear from you! Reach out to us for inquiries and reservations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex items-start gap-4 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Mail size={28} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2 text-gray-800">Email</h3>
                <p className="text-gray-600">costamarinabeachresort@yahoo.com</p>
                <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 flex items-start gap-4 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <PhoneIcon size={28} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2 text-gray-800">Phone Numbers</h3>
                <p className="text-gray-600">📱 Globe: +639-177-958-372</p>
                <p className="text-gray-600">📱 Globe: +639-171-455-125</p>
                <p className="text-gray-600">📱 Smart: +639-190-080-827</p>
                <p className="text-sm text-gray-500 mt-1">Office hours: 8:00 AM - 5:00 PM, Monday to Sunday</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 flex items-start gap-4 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                <MapPin size={28} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2 text-gray-800">Address</h3>
                <p className="text-gray-600">Km. 9, Sasa, Davao City</p>
                <p className="text-sm text-gray-500 mt-1">Boat terminal available at this location</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h3>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none" 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none" 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none" 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea 
                  rows="5" 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Office Hours</h3>
          <p className="text-center text-gray-600">Monday to Sunday: 8:00 AM - 5:00 PM</p>
          <p className="text-center text-sm text-gray-500 mt-2">For after-hours inquiries, please send us an email or message us on Facebook</p>
        </div>
      </div>
    </div>
  )
}

export default ContactPage