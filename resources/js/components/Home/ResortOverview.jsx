import { Award, Eye, Target, Heart } from 'lucide-react'

const ResortOverview = () => {
  const visions = [
    {
      icon: <Eye size={40} />,
      title: "Vision",
      description: "To be the premier beach resort destination in Samal Island, recognized for providing a pristine, relaxing, and memorable tropical experience for every guest."
    },
    {
      icon: <Target size={40} />,
      title: "Mission",
      description: "To deliver exceptional hospitality, maintain a clean and well-preserved natural environment, and offer affordable, high-quality accommodations and leisure services."
    },
    {
      icon: <Heart size={40} />,
      title: "Values",
      description: "Excellence in service, environmental stewardship, guest safety, and genuine Filipino hospitality."
    }
  ]

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Accreditation Badge */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-teal-100 text-teal-800 px-6 py-3 rounded-full">
            <Award size={28} />
            <span className="font-semibold text-lg">Department of Tourism (DOT) Accredited</span>
          </div>
        </div>

        {/* Vision/Mission/Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {visions.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="text-teal-600 mb-4 flex justify-center">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          <div className="bg-teal-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-teal-700">15+</div>
            <div className="text-sm text-gray-600">Years of Excellence</div>
          </div>
          <div className="bg-teal-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-teal-700">50+</div>
            <div className="text-sm text-gray-600">Cozy Cottages</div>
          </div>
          <div className="bg-teal-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-teal-700">10K+</div>
            <div className="text-sm text-gray-600">Happy Guests</div>
          </div>
          <div className="bg-teal-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-teal-700">4.8★</div>
            <div className="text-sm text-gray-600">Guest Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResortOverview