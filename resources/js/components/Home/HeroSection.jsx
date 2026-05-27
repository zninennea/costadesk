import { Calendar, Search } from 'lucide-react'

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Background Image Placeholder */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://via.placeholder.com/1920x1080/0891b3/ffffff?text=INSERT+BEACH+PHOTO+HERE')`,
          // REPLACE THE URL ABOVE WITH YOUR ACTUAL BEACH PHOTO
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light mb-3 animate-fade-in">
            Welcome to
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-slide-up">
            Costa Marina Beach Resort
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            A luxurious and relaxing place to unwind.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <Calendar size={20} />
              <span>Book a Room</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-white/30 flex items-center justify-center space-x-2">
              <Search size={20} />
              <span>Search Availability</span>
            </button>
          </div>

          {/* Quick Info Badges */}
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              🌊 Beachfront Paradise
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              🏆 DOT Accredited
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              🏖️ Family-Friendly
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection