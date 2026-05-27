import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import api from '../api'

function RoomsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const singleRef = useRef(null)
  const hotelRef = useRef(null)
  const dormitoryRef = useRef(null)
  const duplexRef = useRef(null)
  const villaRef = useRef(null)

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms')
        // Filter out maintenance rooms
        setRooms(response.data.filter(r => r.status !== 'maintenance'))
      } catch (e) {
        console.error('Failed to fetch rooms', e)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  // Group rooms by category
  const singleRooms = rooms.filter(r => r.category?.name === 'Single')
  const hotelRooms = rooms.filter(r => r.category?.name === 'Hotel')
  const dormitoryRooms = rooms.filter(r => r.category?.name === 'Dormitory')
  const duplexRooms = rooms.filter(r => r.category?.name === 'Duplex')
  const villaRooms = rooms.filter(r => r.category?.name === 'Villa')

  const handleBookNow = async (roomId, checkIn, checkOut, totalAmount) => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    // Check if user is logged in by getting token
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in or register to book a room.");
      navigate('/login', { state: { returnTo: '/rooms' } });
      return;
    }

    try {
      // Create the booking via API
      await api.post('/bookings', {
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalAmount,
        status: 'pending' // Initial status
      });

      alert("Booking successful! You can view your bookings in your dashboard.");
      navigate('/my-account');
    } catch (e) {
      console.error(e);
      alert("Failed to create booking. Please try again or contact support.");
    }
  }

  // Scroll to specific room type when coming from search availability
  useEffect(() => {
    if (location.state?.scrollToType) {
      const scrollMap = {
        'single': singleRef,
        'hotel': hotelRef,
        'dormitory': dormitoryRef,
        'duplex': duplexRef,
        'villa': villaRef
      }
      const targetRef = scrollMap[location.state.scrollToType]
      if (targetRef?.current) {
        setTimeout(() => {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location.state])

  // Also scroll if coming from "Book a Room" button
  useEffect(() => {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [])

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-24">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Our Accommodations
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-lg">Choose from our wide selection of comfortable and affordable rooms</p>
        </div>

        {/* Quick Navigation Links */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button onClick={() => scrollToSection(singleRef)} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition text-sm font-medium">Single Type</button>
          <button onClick={() => scrollToSection(hotelRef)} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition text-sm font-medium">Hotel Type</button>
          <button onClick={() => scrollToSection(dormitoryRef)} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition text-sm font-medium">Dormitory Type</button>
          <button onClick={() => scrollToSection(duplexRef)} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition text-sm font-medium">Duplex Type</button>
          <button onClick={() => scrollToSection(villaRef)} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition text-sm font-medium">Villa Type</button>
        </div>

        {/* Single Type */}
        <div ref={singleRef} className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
            Single Type
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {singleRooms.map((room, idx) => (
              <RoomCard key={idx} room={room} type="Single" onBookNow={handleBookNow} />
            ))}
          </div>
        </div>

        {/* Hotel Type */}
        <div ref={hotelRef} className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
            Hotel Type
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelRooms.map((room, idx) => (
              <RoomCard key={idx} room={room} type="Hotel" onBookNow={handleBookNow} />
            ))}
          </div>
        </div>

        {/* Dormitory Type */}
        <div ref={dormitoryRef} className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
            Dormitory Type
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dormitoryRooms.map((room, idx) => (
              <RoomCard key={idx} room={room} type="Dormitory" onBookNow={handleBookNow} />
            ))}
          </div>
        </div>

        {/* Duplex Type */}
        <div ref={duplexRef} className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
            Duplex Type
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {duplexRooms.map((room, idx) => (
              <RoomCard key={idx} room={room} type="Duplex" onBookNow={handleBookNow} />
            ))}
          </div>
        </div>

        {/* Villa Type */}
        <div ref={villaRef} className="mb-16 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
            Villa Type
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villaRooms.map((room, idx) => (
              <RoomCard key={idx} room={room} type="Villa" onBookNow={handleBookNow} />
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  )
}

export default RoomsPage