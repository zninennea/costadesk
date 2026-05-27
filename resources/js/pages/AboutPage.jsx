import { Award, Heart, Shield, Users, CheckCircle, Sun } from 'lucide-react'

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-24">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            About Costa Marina Beach Resort
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award size={40} className="text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">DOT Accredited</h3>
              <p className="text-gray-600">
                Officially recognized by the Philippine Department of Tourism for meeting excellence standards
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart size={40} className="text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                To be the premier beach resort destination in Samal Island, recognized for providing pristine, relaxing, and memorable tropical experiences.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield size={40} className="text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To deliver exceptional hospitality, maintain clean natural environment, and offer affordable, high-quality accommodations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Users, text: "Family-Friendly Environment" },
            { icon: CheckCircle, text: "Quality Service Guarantee" },
            { icon: Sun, text: "Sustainable Tourism" }
          ].map((value, idx) => (
            <div key={idx} className="flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <value.icon size={28} className="text-amber-600" />
              <span className="text-gray-700 font-semibold text-lg">{value.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Costa Marina Beach Resort envisions itself as the premier beach resort destination in Samal Island, recognized for providing a pristine, relaxing, and memorable tropical experience for every guest. In pursuit of this vision, the resort is committed to delivering exceptional hospitality, maintaining a clean and well-preserved natural environment, and offering affordable, high-quality accommodations and leisure services that cater to families, groups, and individual travelers.
          </p>
          <p className="text-gray-600 leading-relaxed">
            To realize its vision and mission, Costa Marina Beach Resort operates under the following organizational objectives: to maintain its Department of Tourism (DOT) accreditation and comply with tourism industry standards; to provide accessible, affordable, and quality resort services to guests from Davao and beyond; to preserve the natural beauty of its beachfront and marine environment; and to ensure guest safety and satisfaction through attentive service and the consistent enforcement of its house rules and policies.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage