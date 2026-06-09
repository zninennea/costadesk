import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Calendar, Clock, LogOut, User, Settings,
  CheckCircle, XCircle, Home, Plus, Receipt, AlertCircle,
  Activity, Search, X, Eye, Edit, Trash2, Bell, UserCheck, UserX, BookOpen, Percent
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import WalkInModal from '../../components/WalkInModal'
import ReservationModal from '../../components/ReservationModal'

function StaffDashboard() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentReference, setPaymentReference] = useState('')

  // Modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountId, setDiscountId] = useState('')
  const [discountNotes, setDiscountNotes] = useState('')

  const [selectedGuest, setSelectedGuest] = useState(null)
  const [categoriesList, setCategoriesList] = useState([])
  const [userData, setUserData] = useState({})
  const [guestsList, setGuestsList] = useState([])
  const [roomsList, setRoomsList] = useState([])
  const [bookingsList, setBookingsList] = useState([])

  const [dashboardData, setDashboardData] = useState({
    incomingArrivals: [],
    currentGuests: [],
    pendingCheckouts: [],
    roomsList: [],
    roomStatus: []
  })

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const bookingsRes = await api.get('/bookings')
      const roomsRes = await api.get('/rooms')
      const categoriesRes = await api.get('/rooms/categories').catch(() => ({ data: [] }))
      const guestsRes = await api.get('/guests').catch(() => ({ data: [] }))

      const bookings = bookingsRes.data || []
      const rooms = roomsRes.data || []

      setRoomsList(rooms)
      setBookingsList(bookings)
      setGuestsList(guestsRes.data || [])
      setCategoriesList(categoriesRes.data || [])

      const today = new Date().toISOString().split('T')[0]

      const getGuestName = (booking) => {
        if (booking.user?.first_name) return `${booking.user.first_name} ${booking.user.last_name}`
        if (booking.guest?.first_name) return `${booking.guest.first_name} ${booking.guest.last_name}`
        return `Guest ${booking.id}`
      }

      const incomingArrivals = bookings
        .filter(b => (b.status === 'pending' || b.status === 'confirmed') && b.status !== 'checked_in')
        .map(b => ({
          id: b.id,
          name: getGuestName(b),
          room: b.room?.room_number || 'TBD',
          roomId: b.room_id,
          guests: b.number_of_adults || 1,
          checkIn: b.check_in,
          checkOut: b.check_out,
          status: b.status,
          bookingRef: b.id
        }))

      const currentGuests = bookings
        .filter(b => b.status === 'checked_in')
        .map(b => ({
          id: b.id,
          name: getGuestName(b),
          room: b.room?.room_number || 'TBD',
          roomId: b.room_id,
          guests: b.number_of_adults || 1,
          checkIn: b.check_in,
          checkOut: b.check_out,
          status: b.status,
          bookingRef: b.id,
          bill: b.total_price || 0
        }))

      const pendingCheckouts = bookings
        .filter(b => b.status === 'checked_in' && b.check_out <= today)
        .map(b => ({
          id: b.id,
          name: getGuestName(b),
          room: b.room?.room_number || 'TBD',
          roomId: b.room_id,
          dueTime: "12:00 PM",
          status: b.check_out < today ? 'overdue' : 'pending',
          bookingRef: b.id,
          bill: b.total_price || 0
        }))

      const roomStatus = rooms.map(r => ({
        id: r.id,
        name: r.name || `Room ${r.room_number}`,
        room_number: r.room_number,
        status: r.status,
        type: r.category?.name
      }))

      setDashboardData({
        incomingArrivals,
        currentGuests,
        pendingCheckouts,
        roomsList: rooms.map(r => ({
          id: r.id,
          name: r.name || `Room ${r.room_number}`,
          room_number: r.room_number,
          status: r.status,
          type: r.category?.name,
          price: r.price || r.category?.base_price,
          capacity: r.capacity || r.category?.capacity
        })),
        roomStatus
      })

    } catch (e) {
      console.error('Error fetching data:', e)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleCompleteCheckIn = async () => {
    if (!selectedGuest) {
      alert("Please select a guest")
      return
    }

    const bookingId = selectedGuest.id || selectedGuest.bookingRef

    try {
      await api.post(`/checkin/${bookingId}`)
      alert(`Checked in ${selectedGuest.name} successfully!`)
      setShowCheckInModal(false)
      setSelectedGuest(null)
      fetchData()
    } catch (e) {
      alert(e.response?.data?.error || "Error checking in")
    }
  }

  const handleProcessPayment = async () => {
    if (!selectedGuest) return

    const amount = parseFloat(paymentAmount)
    const billAmount = selectedGuest.bill || 0

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount")
      return
    }

    if (amount > billAmount) {
      alert(`Payment amount cannot exceed bill total of ₱${billAmount.toLocaleString()}`)
      return
    }

    try {
      // First, get the bill for this booking
      const billsRes = await api.get(`/bookings/${selectedGuest.bookingRef}/bill`)

      if (!billsRes || !billsRes.data) {
        alert("No bill found. Please ensure the guest is checked in properly.")
        return
      }

      const bill = billsRes.data

      // Process payment
      const paymentRes = await api.post('/payments', {
        bill_id: bill.id,
        amount_paid: amount,
        payment_method: paymentMethod,
        reference_number: paymentReference || `${paymentMethod.toUpperCase()}-${Date.now()}`
      })

      const remaining = billAmount - amount
      if (remaining <= 0) {
        alert(`✓ Payment of ₱${amount.toLocaleString()} received! Bill is fully paid.`)
      } else {
        alert(`✓ Payment of ₱${amount.toLocaleString()} received! Remaining balance: ₱${remaining.toLocaleString()}`)
      }

      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentReference('')
      fetchData() // Refresh to update bill status
    } catch (e) {
      console.error("Payment error:", e)
      const errorMsg = e.response?.data?.error || "Payment failed"
      alert(errorMsg)
    }
  }

  const handleCompleteCheckOut = async () => {
    if (!selectedGuest) return

    const bookingId = selectedGuest.id || selectedGuest.bookingRef

    try {
      // Check if there's a bill and if it's fully paid
      const billsRes = await api.get(`/bookings/${bookingId}/bill`).catch(() => null)

      if (billsRes && billsRes.data) {
        const bill = billsRes.data
        if (bill.balance_due > 0) {
          // Show payment modal instead
          setShowPaymentModal(true)
          return
        }
      }

      // If no bill or bill is paid, proceed with checkout
      await api.post(`/checkout/${bookingId}`)
      alert(`Checked out ${selectedGuest.name} successfully!`)
      setShowCheckOutModal(false)
      setSelectedGuest(null)
      fetchData()
    } catch (e) {
      console.error("Checkout error:", e)
      alert(e.response?.data?.error || "Error checking out")
    }
  }

  const handleRegisterWalkIn = async (data) => {
    try {
      const availableRoom = dashboardData.roomsList.find(r => r.status === 'available')
      if (!availableRoom) {
        alert("No available rooms")
        return
      }

      await api.post('/checkin/walk-in', {
        first_name: data.firstName,
        last_name: data.lastName,
        mobile: data.phone || 'N/A',
        city: 'N/A',
        room_id: availableRoom.id,
        check_out: new Date(Date.now() + (data.nights || 1) * 86400000).toISOString().split('T')[0],
        number_of_adults: data.guests || 1
      })

      alert(`Walk-in guest ${data.firstName} registered successfully!`)
      setShowWalkInModal(false)
      fetchData()
    } catch (e) {
      alert('Failed to register walk-in guest')
    }
  }

  const handleSaveReservation = async (data) => {
    try {
      await api.post('/bookings/manual-reserve', data)
      alert("Reservation created!")
      setShowReservationModal(false)
      fetchData()
    } catch (e) {
      alert("Failed to create reservation")
    }
  }

  const handleConfirmBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { status: 'confirmed' })
      alert("Booking confirmed successfully.")
      fetchData()
    } catch (e) {
      alert("Failed to confirm booking.")
    }
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' })
      alert("Booking cancelled successfully.")
      fetchData()
    } catch (e) {
      alert("Failed to cancel booking.")
    }
  }

  const handleApplyDiscountRequest = async () => {
    if (!selectedGuest || !discountId) {
      alert("Please select a guest and discount type.");
      return;
    }

    try {
      const bookingId = selectedGuest.id || selectedGuest.bookingRef;
      const billRes = await api.get(`/bookings/${bookingId}/bill`);
      
      if (!billRes.data) {
        alert("No active bill found for this checked-in guest.");
        return;
      }

      const res = await api.post(`/bills/${billRes.data.id}/discounts`, {
        discount_id: parseInt(discountId),
        approval_notes: discountNotes
      });

      alert(res.data.message || "Discount request submitted successfully.");
      setShowDiscountModal(false);
      setSelectedGuest(null);
      setDiscountId('');
      setDiscountNotes('');
      fetchData();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Failed to submit discount request.");
    }
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-neutral-800 text-white shadow-xl z-30 overflow-y-auto">
      <div className="p-6 border-b border-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CoastaDesk</h1>
            <p className="text-xs text-neutral-400">Front Desk System</p>
          </div>
        </div>
        <p className="text-xs text-secondary-400">Staff • Front Desk</p>
      </div>

      <nav className="p-4 space-y-1">
        <div className="text-xs text-neutral-500 uppercase tracking-wider px-3 py-2">Main</div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <div className="text-xs text-neutral-500 uppercase tracking-wider px-3 py-2 mt-4">Operations</div>
        <button
          onClick={() => setShowCheckInModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-700"
        >
          <UserCheck size={18} />
          Check-in
        </button>
        <button
          onClick={() => setShowCheckOutModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-700"
        >
          <UserX size={18} />
          Check-out
        </button>
        <button
          onClick={() => setShowWalkInModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-700"
        >
          <Plus size={18} />
          Walk-in registration
        </button>
        <button
          onClick={() => setActiveTab('online_bookings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'online_bookings' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Calendar size={18} />
          Online Bookings
        </button>

        <div className="text-xs text-neutral-500 uppercase tracking-wider px-3 py-2 mt-4">Records & Billing</div>
        <button
          onClick={() => setShowDiscountModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-700"
        >
          <Percent size={18} />
          Apply SC/PWD
        </button>
        <button
          onClick={() => setActiveTab('guests')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Users size={18} />
          Guests
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reservations' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <BookOpen size={18} />
          Reservations
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Home size={18} />
          Rooms
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'billing' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
          <Receipt size={18} />
          Billing
        </button>
      </nav>
    </div>
  )

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      const occupiedRooms = dashboardData.roomStatus.filter(r => r.status === 'occupied').length
      const totalRooms = dashboardData.roomStatus.length
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-secondary-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm">Incoming arrivals</p>
                  <p className="text-3xl font-bold text-neutral-800">{dashboardData.incomingArrivals.length}</p>
                </div>
                <UserCheck size={28} className="text-secondary-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm">Currently checked in</p>
                  <p className="text-3xl font-bold text-neutral-800">{dashboardData.currentGuests.length}</p>
                </div>
                <Users size={28} className="text-primary-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm">Pending checkouts</p>
                  <p className="text-3xl font-bold text-neutral-800">{dashboardData.pendingCheckouts.length}</p>
                </div>
                <Clock size={28} className="text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-500 text-sm">Occupancy</p>
                  <p className="text-3xl font-bold text-neutral-800">{occupancyRate}%</p>
                  <p className="text-xs text-neutral-400">{occupiedRooms}/{totalRooms} rooms</p>
                </div>
                <Home size={28} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => setShowReservationModal(true)} className="bg-primary-600 text-white rounded-lg py-2 px-3 text-sm hover:bg-primary-700">📅 New Reservation</button>
            <button onClick={() => setShowWalkInModal(true)} className="bg-primary-600 text-white rounded-lg py-2 px-3 text-sm hover:bg-primary-700">➕ Walk-in</button>
            <button onClick={() => setShowCheckInModal(true)} className="bg-secondary-600 text-white rounded-lg py-2 px-3 text-sm hover:bg-secondary-700">✓ Check-in</button>
            <button onClick={() => setShowCheckOutModal(true)} className="bg-secondary-600 text-white rounded-lg py-2 px-3 text-sm hover:bg-secondary-700">✗ Check-out</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-neutral-800 mb-3">Incoming Arrivals</h3>
            {dashboardData.incomingArrivals.length === 0 ? (
              <p className="text-neutral-400 text-center py-4">No incoming arrivals</p>
            ) : (
              <div className="space-y-2">
                {dashboardData.incomingArrivals.map(arrival => (
                  <div key={arrival.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">{arrival.name}</p>
                      <p className="text-sm text-neutral-500">Room {arrival.room} · {arrival.guests} guests</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGuest(arrival)
                        setShowCheckInModal(true)
                      }}
                      className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                    >
                      Check in
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-neutral-800 mb-3">Current Guests</h3>
            {dashboardData.currentGuests.length === 0 ? (
              <p className="text-neutral-400 text-center py-4">No guests currently checked in</p>
            ) : (
              <div className="space-y-2">
                {dashboardData.currentGuests.map(guest => (
                  <div key={guest.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-neutral-500">Room {guest.room} · Check-out {guest.checkOut}</p>
                      <p className="text-xs text-primary-600 font-medium">Bill: ₱{guest.bill?.toLocaleString() || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGuest(guest)
                          setShowPaymentModal(true)
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGuest(guest)
                          setShowCheckOutModal(true)
                        }}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Check out
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (activeTab === 'reservations') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Reservations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Check Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm">{booking.id}</td>
                    <td className="px-4 py-3 text-sm">{booking.user?.first_name || booking.guest?.first_name || 'Guest'}</td>
                    <td className="px-4 py-3 text-sm">{booking.room?.room_number || '-'}</td>
                    <td className="px-4 py-3 text-sm">{booking.check_in}</td>
                    <td className="px-4 py-3 text-sm">{booking.check_out}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'rooms') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Room Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dashboardData.roomStatus.map(room => (
              <div key={room.id} className="p-3 bg-neutral-50 rounded-lg border">
                <p className="font-bold">{room.name}</p>
                <p className="text-sm text-neutral-500">{room.type || 'Standard'}</p>
                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${room.status === 'available' ? 'bg-green-100 text-green-700' :
                  room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                    room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === 'billing') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Billing & Payments</h2>
          {dashboardData.currentGuests.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No active guests with bills</p>
          ) : (
            <div className="space-y-4">
              {dashboardData.currentGuests.map(guest => (
                <div key={guest.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{guest.name}</p>
                      <p className="text-sm text-neutral-500">Room {guest.room}</p>
                      <p className="text-sm text-neutral-500">Check-in: {guest.checkIn}</p>
                      <p className="text-sm text-neutral-500">Check-out: {guest.checkOut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">₱{guest.bill?.toLocaleString() || 0}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedGuest(guest)
                            setShowPaymentModal(true)
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Make Payment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGuest(guest)
                            setShowCheckOutModal(true)
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'online_bookings') {
      const onlineBookings = (bookingsList || []).filter(b => b.status === 'pending');
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Online Bookings Approval Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Booking Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Check In - Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {onlineBookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-primary-600 font-medium">{booking.booking_code || `CMB-${booking.id}`}</td>
                    <td className="px-4 py-3 text-sm">
                      {booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : 
                       booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Guest'}
                    </td>
                    <td className="px-4 py-3 text-sm">Room {booking.room?.room_number || '-'}</td>
                    <td className="px-4 py-3 text-sm">{booking.check_in} to {booking.check_out}</td>
                    <td className="px-4 py-3 text-sm capitalize">{booking.source_channel || 'Website'}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₱{(booking.total_price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title="Confirm Booking"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Cancel Booking"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {onlineBookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-neutral-400">No pending online bookings awaiting approval</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'guests') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Guests Catalog</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="p-3 text-xs font-medium text-neutral-500">Name</th>
                  <th className="p-3 text-xs font-medium text-neutral-500">Email</th>
                  <th className="p-3 text-xs font-medium text-neutral-500">Mobile</th>
                  <th className="p-3 text-xs font-medium text-neutral-500">Location</th>
                  <th className="p-3 text-xs font-medium text-neutral-500">Blacklisted</th>
                </tr>
              </thead>
              <tbody>
                {(guestsList || []).map(guest => (
                  <tr key={guest.id} className="border-b hover:bg-neutral-50">
                    <td className="p-3 font-semibold text-sm">{guest.first_name} {guest.last_name}</td>
                    <td className="p-3 text-sm">{guest.email || 'N/A'}</td>
                    <td className="p-3 text-sm">{guest.mobile || guest.phone || 'N/A'}</td>
                    <td className="p-3 text-sm">{guest.city ? `${guest.city}, ${guest.country || 'Philippines'}` : 'N/A'}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${guest.is_blacklisted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {guest.is_blacklisted ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!guestsList || guestsList.length === 0) && (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-neutral-400">No guests found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Sidebar />

      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">Staff Dashboard</h1>
                <p className="text-sm text-neutral-500">{currentTime.toLocaleString()}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100"
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-neutral-800">{userData.firstName || 'Staff'}</p>
                    <p className="text-xs text-neutral-500">Front Desk</p>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-6 border-t mt-3 pt-3">
              <button onClick={() => setActiveTab('dashboard')} className={`text-sm ${activeTab === 'dashboard' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('online_bookings')} className={`text-sm ${activeTab === 'online_bookings' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Online Bookings</button>
              <button onClick={() => setActiveTab('guests')} className={`text-sm ${activeTab === 'guests' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Guests</button>
              <button onClick={() => setActiveTab('reservations')} className={`text-sm ${activeTab === 'reservations' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Reservations</button>
              <button onClick={() => setActiveTab('rooms')} className={`text-sm ${activeTab === 'rooms' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Rooms</button>
              <button onClick={() => setActiveTab('billing')} className={`text-sm ${activeTab === 'billing' ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-neutral-500'}`}>Billing</button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Check-in Guest</h2>
              <button onClick={() => setShowCheckInModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6">
              <select
                className="w-full px-3 py-2 border rounded-lg mb-4"
                onChange={(e) => {
                  const guest = dashboardData.incomingArrivals.find(g => g.id === parseInt(e.target.value))
                  setSelectedGuest(guest)
                }}
                value={selectedGuest?.id || ''}
              >
                <option value="">Select a booking</option>
                {dashboardData.incomingArrivals.map(g => (
                  <option key={g.id} value={g.id}>{g.id} - {g.name} (Room {g.room})</option>
                ))}
              </select>
              {selectedGuest && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium">{selectedGuest.name}</p>
                  <p className="text-sm text-gray-600">Room: {selectedGuest.room}</p>
                </div>
              )}
              <button onClick={handleCompleteCheckIn} disabled={!selectedGuest} className="w-full py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">Confirm Check-in</button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Check-out Guest</h2>
              <button onClick={() => setShowCheckOutModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6">
              <select
                className="w-full px-3 py-2 border rounded-lg mb-4"
                onChange={(e) => {
                  const guest = dashboardData.currentGuests.find(g => g.id === parseInt(e.target.value))
                  setSelectedGuest(guest)
                }}
                value={selectedGuest?.id || ''}
              >
                <option value="">Select a guest</option>
                {dashboardData.currentGuests.map(g => (
                  <option key={g.id} value={g.id}>{g.name} - Room {g.room} (₱{g.bill?.toLocaleString()})</option>
                ))}
              </select>
              {selectedGuest && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium">{selectedGuest.name}</p>
                  <p className="text-sm text-gray-600">Room: {selectedGuest.room}</p>
                  <p className="text-sm font-bold text-primary-600">Bill: ₱{selectedGuest.bill?.toLocaleString() || 0}</p>
                </div>
              )}
              <button onClick={handleCompleteCheckOut} disabled={!selectedGuest} className="w-full py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50">Confirm Check-out</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Process Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedGuest.name}</p>
                <p className="text-sm text-gray-600">Room: {selectedGuest.room}</p>
                <p className="text-lg font-bold text-primary-600 mt-2">Total Bill: ₱{selectedGuest.bill?.toLocaleString() || 0}</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Payment Amount (₱)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['cash', 'credit_card', 'gcash'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg border text-sm capitalize ${paymentMethod === method
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {method === 'credit_card' ? 'Card' : method}
                    </button>
                  ))}
                </div>
              </div>

              {(paymentMethod === 'gcash' || paymentMethod === 'credit_card') && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Reference Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter reference number"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleProcessPayment} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Process Payment</button>
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      <WalkInModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        onSave={handleRegisterWalkIn}
        categories={categoriesList}
      />

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onSave={handleSaveReservation}
        rooms={dashboardData.roomsList}
      />

      {/* Apply Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-800">Apply SC/PWD Discount Request</h2>
              <button onClick={() => setShowDiscountModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1 text-sm">Select Active Guest</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  onChange={(e) => {
                    const guest = dashboardData.currentGuests.find(g => g.id === parseInt(e.target.value))
                    setSelectedGuest(guest)
                  }}
                  value={selectedGuest?.id || ''}
                >
                  <option value="">Select a guest</option>
                  {dashboardData.currentGuests.map(guest => (
                    <option key={guest.id} value={guest.id}>{guest.name} - Room {guest.room}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1 text-sm">Discount Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={discountId}
                  onChange={(e) => setDiscountId(e.target.value)}
                >
                  <option value="">Select Discount</option>
                  <option value="1">Senior Citizen (20%)</option>
                  <option value="2">PWD (20%)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1 text-sm">Notes / Reference (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. SC ID No. 12345"
                  value={discountNotes}
                  onChange={(e) => setDiscountNotes(e.target.value)}
                  rows="2"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleApplyDiscountRequest}
                  disabled={!selectedGuest || !discountId}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold disabled:opacity-50 text-sm"
                >
                  Submit Request
                </button>
                <button 
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDashboard