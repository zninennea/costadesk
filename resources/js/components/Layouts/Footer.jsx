import { Facebook, Mail, Phone, MapPin, Globe } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Left Section - CoastaDesk Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              {/* Logo Space */}
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌊</span>
              </div>
              <h2 className="text-2xl font-bold">CoastaDesk</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your seamless front-desk experience at Costa Marina Beach Resort.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-teal-600 transition-colors">
                <Facebook size={20} />
              </a>
              {/* Add more social icons as needed */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#home" className="hover:text-teal-400 transition-colors">Home</a></li>
              <li><a href="#rooms" className="hover:text-teal-400 transition-colors">Rooms & Cottages</a></li>
              <li><a href="#activities" className="hover:text-teal-400 transition-colors">Activities</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start space-x-2">
                <Mail size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">costamarinabeachresort@yahoo.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone size={18} className="mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p>(Globe) +639-177-958-372</p>
                  <p>(Globe) +639-171-455-125</p>
                  <p>(Smart) +639-190-080-827</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">Km. 9, Sasa, Davao City</span>
              </li>
            </ul>
          </div>

          {/* Map or Additional Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-teal-400">Visit Us</h3>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <Globe size={32} className="mx-auto mb-2 text-teal-400" />
              <p className="text-sm text-gray-400">Samal Island's Premier Beach Resort</p>
              <p className="text-xs text-gray-500 mt-2">DOT Accredited</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">CoastaDesk @ 2026 - All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer