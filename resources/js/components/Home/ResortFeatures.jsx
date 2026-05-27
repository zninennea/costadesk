import { Umbrella, Utensils, Home, Bike, Camera, Waves } from 'lucide-react'

const ResortFeatures = () => {
  const features = [
    {
      icon: <Umbrella size={48} />,
      title: "Pristine Beach",
      description: "White sand beach with crystal clear waters, perfect for swimming and sunbathing.",
      imagePlaceholder: "beach-photo-placeholder",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: <Utensils size={48} />,
      title: "Fine Dining",
      description: "Delicious local and international cuisine at our on-site restaurant.",
      imagePlaceholder: "food-photo-placeholder",
      color: "from-orange-500 to-red-400"
    },
    {
      icon: <Home size={48} />,
      title: "Luxurious Rooms",
      description: "Comfortable cottages and rooms from ₱3,000 to ₱15,000 per day.",
      imagePlaceholder: "rooms-photo-placeholder",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: <Bike size={48} />,
      title: "Water Activities",
      description: "Jet skiing, banana boat rides, kayaking, and more adventures await!",
      imagePlaceholder: "activities-photo-placeholder",
      color: "from-green-500 to-teal-400"
    },
    {
      icon: <Camera size={48} />,
      title: "Breathtaking Sceneries",
      description: "Instagram-worthy views of sunsets, beachfront, and tropical landscapes.",
      imagePlaceholder: "sceneries-photo-placeholder",
      color: "from-yellow-500 to-orange-400"
    },
    {
      icon: <Waves size={48} />,
      title: "Pool & Recreation",
      description: "Swimming pool, beach volleyball, billiards, darts, and children's playground.",
      imagePlaceholder: "recreation-photo-placeholder",
      color: "from-indigo-500 to-blue-400"
    }
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Our Premium Services & Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the best of Costa Marina Beach Resort with our world-class amenities and warm Filipino hospitality
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Image Placeholder Space */}
              <div className={`h-48 bg-gradient-to-r ${feature.color} relative overflow-hidden`}>
                {/* Replace this div with actual image */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-mono bg-black/30 px-3 py-1 rounded-full">
                      INSERT {feature.imagePlaceholder.toUpperCase()} HERE
                    </p>
                  </div>
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="text-teal-600 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <button className="mt-4 text-teal-600 font-semibold hover:text-teal-700 transition-colors inline-flex items-center">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Banner */}
        <div className="mt-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Special Packages Available!</h3>
          <p className="mb-4">Day tour: ₱350/adult, ₱250/child | Cottages from ₱3,000 per day</p>
          <button className="bg-white text-teal-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            View All Packages
          </button>
        </div>
      </div>
    </section>
  )
}

export default ResortFeatures