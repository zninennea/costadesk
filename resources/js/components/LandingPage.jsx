import { useState } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  Bed, 
  Activity, 
  Info, 
  HelpCircle, 
  Phone, 
  LogIn,
  Calendar,
  Search,
  Waves,
  UtensilsCrossed,
  Hotel,
  Ship,
  Camera,
  Facebook,
  MapPin,
  Mail,
  Smartphone,
  Award,
  Eye,
  Heart,
  Star,
  Umbrella,
} from 'lucide-react'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const navLinks = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'Rooms', href: '#rooms', icon: Bed },
    { name: 'Activities', href: '#activities', icon: Activity },
    { name: 'About Us', href: '#about', icon: Info },
    { name: 'FAQ', href: '#faq', icon: HelpCircle },
    { name: 'Contact', href: '#contact', icon: Phone },
  ]

  const features = [
    { icon: Waves, title: 'Pristine Beach', description: 'White sand beach with crystal clear waters perfect for swimming and relaxation' },
    { icon: UtensilsCrossed, title: 'Food & Beverage', description: 'On-site restaurant serving delicious local and international cuisine' },
    { icon: Hotel, title: 'Comfortable Rooms', description: 'Well-appointed cottages from ₱3,000 to ₱15,000 per day' },
    { icon: Ship, title: 'Water Activities', description: 'Jet skiing, banana boat rides, kayaking, and more' },
    { icon: Camera, title: 'Instagrammable Spots', description: 'Beautiful sceneries and photo-worthy locations throughout the resort' },
    { icon: Umbrella, title: 'Day Tour Packages', description: '₱350 per adult, ₱250 per child (4-10 years old)' },
  ]

  const activities = [
    { name: 'Jet Skiing', price: '₱1,500/30min', icon: Ship },
    { name: 'Banana Boat', price: '₱250/person', icon: Ship },
    { name: 'Kayaking', price: '₱200/hour', icon: Waves },
    { name: 'Beach Volleyball', price: 'Free', icon: Activity },
    { name: 'Billiards', price: '₱100/hour', icon: Activity },
    { name: 'Karaoke', price: '₱300/hour', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <Waves className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-teal-800">Costa Marina</h1>
                <p className="text-xs text-gray-600">Beach Resort</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-teal-600 transition-colors duration-200 flex items-center gap-1"
                >
                  <link.icon size={16} />
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            {/* Login Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <button className="hidden md:flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                <LogIn size={16} />
                Login
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 hover:text-teal-600 py-2 flex items-center gap-2"
                >
                  <link.icon size={18} />
                  {link.name}
                </a>
              ))}
              <button className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                <LogIn size={18} />
                Login
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 min-h-screen relative bg-gradient-to-br from-teal-900 to-blue-900">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto px-4 py-32 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to Costa Marina
            <span className="block text-3xl md:text-4xl mt-2">Beach Resort</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
            A luxurious and relaxing place to unwind in Samal Island
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              Book a Room
            </button>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-white">
              <Search size={20} />
              Search Availability
            </button>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Resort Overview Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">About Costa Marina</h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
          </div>

          {/* Accreditation Badges */}
          <div className="flex justify-center gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-3">
              <Award className="text-teal-600" size={32} />
              <div>
                <p className="font-semibold">DOT Accredited</p>
                <p className="text-sm text-gray-600">Department of Tourism</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md px-6 py-3 flex items-center gap-3">
              <Star className="text-yellow-500" size={32} />
              <div>
                <p className="font-semibold">Quality Service</p>
                <p className="text-sm text-gray-600">Premier Beach Resort</p>
              </div>
            </div>
          </div>

          {/* Vision, Mission, Values */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <Eye className="text-teal-600 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To be the premier beach resort destination in Samal Island, recognized for providing a pristine, relaxing, and memorable tropical experience for every guest.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <Heart className="text-teal-600 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To deliver exceptional hospitality, maintain a clean and well-preserved natural environment, and offer affordable, high-quality accommodations and leisure services.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <Star className="text-teal-600 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-3">Our Values</h3>
              <p className="text-gray-600">
                Excellence in service, Environmental stewardship, Guest safety and satisfaction, Affordable luxury, Family-friendly atmosphere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resort Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Resort Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the best of tropical paradise with our world-class amenities and services
            </p>
            <div className="w-24 h-1 bg-teal-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all group">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                  <feature.icon className="text-teal-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Our Accommodations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our wide selection of comfortable cottages and rooms
            </p>
            <div className="w-24 h-1 bg-teal-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="h-48 bg-teal-600 flex items-center justify-center">
                <Hotel size={64} className="text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Standard Cottage</h3>
                <p className="text-gray-600 mb-4">Perfect for couples or small families (2-4 persons)</p>
                <p className="text-2xl font-bold text-teal-600">₱3,000<span className="text-sm font-normal text-gray-500">/day</span></p>
                <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-lg transform md:scale-105">
              <div className="h-48 bg-teal-500 flex items-center justify-center">
                <Hotel size={64} className="text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Deluxe Cottage</h3>
                <p className="text-gray-600 mb-4">Spacious with beach view (4-6 persons)</p>
                <p className="text-2xl font-bold text-teal-600">₱8,000<span className="text-sm font-normal text-gray-500">/day</span></p>
                <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="h-48 bg-teal-700 flex items-center justify-center">
                <Hotel size={64} className="text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Family Suite</h3>
                <p className="text-gray-600 mb-4">Dormitory type for large groups (8-12 persons)</p>
                <p className="text-2xl font-bold text-teal-600">₱15,000<span className="text-sm font-normal text-gray-500">/day</span></p>
                <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Water Activities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Exciting water sports and recreational activities for all ages
            </p>
            <div className="w-24 h-1 bg-teal-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {activities.map((activity, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 text-center hover:shadow-lg transition-all">
                <activity.icon className="mx-auto mb-2 text-teal-600" size={32} />
                <h3 className="font-semibold text-sm mb-1">{activity.name}</h3>
                <p className="text-teal-600 font-bold text-xs">{activity.price}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 text-sm">
              Plus: Children's playground, beach volleyball, billiards, darts, and more!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "What are the check-in and check-out times?", a: "Check-in is at 3:00 PM and check-out is at 12:00 PM (noon)." },
              { q: "Is outside food allowed?", a: "No, bringing outside food and beverages is strictly prohibited. Our on-site restaurant serves delicious meals." },
              { q: "Are pets allowed?", a: "Pets are not permitted within the resort premises for the safety and comfort of all guests." },
              { q: "What is the cancellation policy?", a: "We have a no-cancellation, no-refund policy. However, rebooking is allowed once subject to availability." },
              { q: "Is there a boat service to the resort?", a: "Yes, boat service operates from 6:30 AM to 4:00 PM from Km. 9, Sasa, Davao City. Fare is ₱25 per person." },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-2 text-teal-800">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-teal-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">costamarinabeachresort@yahoo.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="text-teal-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Phone Numbers</p>
                    <p className="text-gray-600">Globe: +639-177-958-372</p>
                    <p className="text-gray-600">Globe: +639-171-455-125</p>
                    <p className="text-gray-600">Smart: +639-190-080-827</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-teal-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">Km. 9, Sasa, Davao City</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
                <textarea 
                  placeholder="Your Message" 
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                ></textarea>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Waves size={24} className="text-teal-400" />
                <h3 className="text-xl font-bold">CoastaDesk</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted front-desk management system for an unforgettable beach resort experience.
              </p>
              <div className="flex gap-3">
                <a href="#" className="hover:text-teal-400 transition-colors">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-teal-400 transition-colors">Home</a></li>
                <li><a href="#rooms" className="hover:text-teal-400 transition-colors">Rooms</a></li>
                <li><a href="#activities" className="hover:text-teal-400 transition-colors">Activities</a></li>
                <li><a href="#about" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-2">
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail size={16} />
                  costamarinabeachresort@yahoo.com
                </p>
                <p className="flex items-center gap-2">
                  <Smartphone size={16} />
                  Globe: +639-177-958-372
                </p>
                <p className="pl-6">Globe: +639-171-455-125</p>
                <p className="pl-6">Smart: +639-190-080-827</p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} />
                  Km. 9, Sasa, Davao City
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 CoastaDesk - Costa Marina Beach Resort. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Booking Modal (Placeholder) */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Book a Room</h3>
            <p className="text-gray-600 mb-4">Booking functionality coming soon!</p>
            <button 
              onClick={() => setShowBookingModal(false)}
              className="w-full bg-teal-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage