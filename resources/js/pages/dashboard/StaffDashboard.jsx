import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Users, Calendar, Clock, LogOut, User, Settings, 
  CheckCircle, XCircle, Home, Plus, Receipt, FileText, AlertCircle,
  Activity, Search, Filter, X, Eye, Edit, Trash2,
  Bell, UserCheck, UserX, DoorOpen, ClipboardList, BookOpen,
  Phone, Mail, MapPin, Calendar as CalendarIcon, DollarSign,
  Printer, Download, ChevronDown, ChevronUp, MoreVertical
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

function StaffDashboard() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedView, setSelectedView] = useState(null)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedBooking, setExpandedBooking] = useState(null)
  
  // Modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showHouseRulesModal, setShowHouseRulesModal] = useState(false)
  const [showGuestDetailsModal, setShowGuestDetailsModal] = useState(false)
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [chargeAmount, setChargeAmount] = useState('')
  const [discountId, setDiscountId] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const [userData, setUserData] = useState({})

  const [walkInForm, setWalkInForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roomType: '',
    nights: 1,
    guests: 1,
    checkInDate: new Date().toISOString().split('T')[0],
    specialRequests: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [actualBill, setActualBill] = useState(null)
  
  const [houseRuleEntry, setHouseRuleEntry] = useState({
    guestName: '',
    room: '',
    ruleViolated: '',
    description: '',
    actionTaken: ''
  })

  const [addOns, setAddOns] = useState([
    { id: 1, name: 'Jet Ski Rental (30 min)', price: 1500, quantity: 0 },
    { id: 2, name: 'Banana Boat Ride (15 min)', price: 500, quantity: 0 },
    { id: 3, name: 'Extra Breakfast', price: 250, quantity: 0 },
    { id: 4, name: 'Extra Towel', price: 50, quantity: 0 },
    { id: 5, name: 'Extra Pillow/Blanket', price: 100, quantity: 0 },
    { id: 6, name: 'Karaoke Rental (per hour)', price: 300, quantity: 0 }
  ])

  const [dashboardData, setDashboardData] = useState({
    arrivalsToday: { total: 0, checkedIn: 0, list: [] },
    departuresToday: { total: 0, pending: 0, list: [] },
    guestsOnProperty: 0,
    roomsOccupied: 0,
    totalRooms: 0,
    roomStatus: [],
    incomingArrivals: [],
    pendingCheckouts: [],
    notifications: [],
    reservations: [],
    allGuests: [],
    roomsList: [],
    houseRulesLogs: []
  });

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/reports/dashboard-stats');
      const bookingsRes = await api.get('/bookings');
      const roomsRes = await api.get('/rooms');

      const bookings = bookingsRes.data;
      const rooms = roomsRes.data;
      const stats = statsRes.data;

      const today = new Date().toISOString().split('T')[0];
      const incoming = bookings.filter(b => b.status === 'pending');
      const checkouts = bookings.filter(b => b.status === 'checked_in' && b.check_out <= today);
      const checkedIn = bookings.filter(b => b.status === 'checked_in');

      setDashboardData({
        arrivalsToday: { total: incoming.length, checkedIn: 0, list: incoming.map(b => ({ id: b.id, name: b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id, room: b.room?.room_number, roomId: b.room_id, guests: 1, time: b.check_in, status: b.status, bookingRef: b.id, phone: b.user?.phone || 'N/A', email: b.user?.email })) },
        departuresToday: { total: checkouts.length, pending: checkouts.length, list: checkouts.map(b => ({ id: b.id, name: b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id, room: b.room?.room_number, roomId: b.room_id, dueTime: "12:00 PM", status: "pending", bill: b.total_price })) },
        guestsOnProperty: checkedIn.length,
        roomsOccupied: stats.occupancy.occupied,
        totalRooms: stats.occupancy.total,
        roomStatus: rooms.map(r => {
           let guestName = null;
           let guestId = null;
           let chkIn = null;
           let chkOut = null;
           if(r.status === 'occupied') {
             const b = bookings.find(bk => bk.room_id === r.id && bk.status === 'checked_in');
             if (b) {
                guestName = b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id;
                guestId = b.id;
                chkIn = b.check_in;
                chkOut = b.check_out;
             }
           }
           return { id: r.id, name: "Room " + r.room_number, status: r.status, type: r.category?.name, guest: guestName, guestId: guestId, checkIn: chkIn, checkOut: chkOut };
        }),
        incomingArrivals: incoming.map(b => ({ id: b.id, name: b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id, room: b.room?.room_number, roomId: b.room_id, guests: 1, time: "3:00 PM", status: b.status, bookingRef: b.id, phone: b.user?.phone || 'N/A', email: b.user?.email })),
        pendingCheckouts: checkouts.map(b => ({ id: b.id, name: b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id, room: b.room?.room_number, roomId: b.room_id, dueTime: "12:00 PM", status: "pending", bill: b.total_price })),
        notifications: [],
        reservations: bookings.map(b => ({ id: b.id, bookingRef: b.id, code: "CMB-"+b.id, guest: b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id, checkIn: b.check_in, checkOut: b.check_out, status: b.status, room: b.room?.room_number, guests: 1, amount: b.total_price })),
        allGuests: checkedIn.map(b => ({ id: b.id, name: b.user ? b.user.first_name + ' ' + b.user.last_name : 'Guest ' + b.id, room: b.room?.room_number, status: b.status, checkIn: b.check_in, checkOut: b.check_out, phone: b.user?.phone || 'N/A', email: b.user?.email, bookingRef: b.id })),
        roomsList: rooms.map(r => ({ id: r.id, name: "Room " + r.room_number, status: r.status, type: r.category?.name, price: r.category?.base_price, capacity: r.category?.capacity })),
        houseRulesLogs: []
      });
      
      const logsRes = await api.get('/reports/activity-logs').catch(()=>({data:[]}));
      setDashboardData(prev => ({
        ...prev,
        houseRulesLogs: logsRes.data
      }));
      
      const addonsRes = await api.get('/addons').catch(()=>null);
      if (addonsRes && addonsRes.data) {
        setAddOns(addonsRes.data.filter(a => a.addon_code !== 'CUSTOM').map(a => ({
          id: a.id,
          name: a.addon_name,
          price: a.price,
          quantity: 0
        })));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Removed mock data array setup
  const mockDataPlaceholder = {
    arrivalsToday: { total: 8, checkedIn: 3, list: [
      { id: 1, name: "Santos, Maria", room: "Cottage B", roomId: 2, guests: 2, time: "3:00 PM", status: "pending", bookingRef: "BK-001", phone: "09123456789", email: "maria@email.com" },
      { id: 2, name: "Reyes, Juan", room: "Dormitory 1", roomId: 7, guests: 6, time: "3:00 PM", status: "checked_in", bookingRef: "BK-002", phone: "09123456780", email: "juan@email.com" },
      { id: 3, name: "Dela Cruz, Ana", room: "Cottage A", roomId: 1, guests: 4, time: "Day tour", status: "checked_in", bookingRef: "BK-003", phone: "09123456781", email: "ana@email.com" }
    ] },
    departuresToday: { total: 5, pending: 2, list: [
      { id: 1, name: "Lim, Carlos", room: "Cottage C", roomId: 3, dueTime: "12:00 PM", status: "overdue", bill: 4800 },
      { id: 2, name: "Garcia, Rosa", room: "Cottage D", roomId: 4, dueTime: "12:00 PM", status: "pending", bill: 5500 },
      { id: 3, name: "Fernandez, Mike", room: "Cottage E", roomId: 5, dueTime: "1:00 PM", status: "pending", bill: 4800 }
    ] },
    guestsOnProperty: 24,
    roomsOccupied: 7,
    totalRooms: 12,
    roomStatus: [
      { id: 1, name: "Cottage A", status: "occupied", type: "cottage", guest: "Dela Cruz, Ana", guestId: 3, checkIn: "May 10, 2026", checkOut: "May 12, 2026", phone: "09123456781" },
      { id: 2, name: "Cottage B", status: "available", type: "cottage", guest: null },
      { id: 3, name: "Cottage C", status: "occupied", type: "cottage", guest: "Lim, Carlos", guestId: 4, checkIn: "May 9, 2026", checkOut: "May 11, 2026", phone: "09123456782" },
      { id: 4, name: "Cottage D", status: "occupied", type: "cottage", guest: "Garcia, Rosa", guestId: 5, checkIn: "May 10, 2026", checkOut: "May 11, 2026", phone: "09123456783" },
      { id: 5, name: "Cottage E", status: "available", type: "cottage", guest: null },
      { id: 6, name: "Cottage F", status: "maintenance", type: "cottage", guest: null },
      { id: 7, name: "Dormitory 1", status: "occupied", type: "dormitory", guest: "Reyes, Juan", guestId: 2, checkIn: "May 10, 2026", checkOut: "May 11, 2026", phone: "09123456780" },
      { id: 8, name: "Dormitory 2", status: "available", type: "dormitory", guest: null },
      { id: 9, name: "Villa Rosario", status: "available", type: "villa", guest: null },
      { id: 10, name: "Casa Maria", status: "occupied", type: "single", guest: "Santos, Maria", guestId: 1, checkIn: "May 11, 2026", checkOut: "May 12, 2026", phone: "09123456789" }
    ],
    incomingArrivals: [
      { id: 1, name: "Santos, Maria", room: "Cottage B", roomId: 2, guests: 2, time: "3:00 PM", status: "pending", bookingRef: "BK-001", phone: "09123456789", email: "maria@email.com" },
      { id: 2, name: "Reyes, Juan", room: "Dormitory 1", roomId: 7, guests: 6, time: "3:00 PM", status: "checked_in", bookingRef: "BK-002", phone: "09123456780", email: "juan@email.com" },
      { id: 3, name: "Dela Cruz, Ana", room: "Cottage A", roomId: 1, guests: 4, time: "Day tour", status: "checked_in", bookingRef: "BK-003", phone: "09123456781", email: "ana@email.com" }
    ],
    pendingCheckouts: [
      { id: 1, name: "Lim, Carlos", room: "Cottage C", roomId: 3, dueTime: "12:00 PM", status: "overdue", bill: 4800 },
      { id: 2, name: "Garcia, Rosa", room: "Cottage D", roomId: 4, dueTime: "12:00 PM", status: "pending", bill: 5500 },
      { id: 3, name: "Fernandez, Mike", room: "Cottage E", roomId: 5, dueTime: "1:00 PM", status: "pending", bill: 4800 }
    ],
    notifications: [
      { id: 1, text: "Lim, Carlos — checkout overdue", type: "urgent", time: "5 min ago", read: false },
      { id: 2, text: "Online booking #042 needs confirmation", type: "warning", time: "15 min ago", read: false },
      { id: 3, text: "Cottage D inspection complete", type: "info", time: "1 hour ago", read: true }
    ],
    reservations: [
      { id: 1, bookingRef: "BK-001", code: "CMB-2026-001", guest: "Santos, Maria", checkIn: "2026-05-11", checkOut: "2026-05-12", status: "pending", room: "Cottage B", guests: 2, amount: 4800 },
      { id: 2, bookingRef: "BK-002", code: "CMB-2026-002", guest: "Reyes, Juan", checkIn: "2026-05-10", checkOut: "2026-05-11", status: "checked_in", room: "Dormitory 1", guests: 6, amount: 13000 },
      { id: 3, bookingRef: "BK-003", code: "CMB-2026-003", guest: "Dela Cruz, Ana", checkIn: "2026-05-10", checkOut: "2026-05-12", status: "checked_in", room: "Cottage A", guests: 4, amount: 9600 },
      { id: 4, bookingRef: "BK-004", code: "CMB-2026-004", guest: "Lim, Carlos", checkIn: "2026-05-09", checkOut: "2026-05-11", status: "due_out", room: "Cottage C", guests: 4, amount: 9600 }
    ],
    allGuests: [
      { id: 1, name: "Santos, Maria", room: "Cottage B", status: "pending", checkIn: "May 11, 2026", checkOut: "May 12, 2026", phone: "09123456789", email: "maria@email.com", bookingRef: "BK-001" },
      { id: 2, name: "Reyes, Juan", room: "Dormitory 1", status: "checked_in", checkIn: "May 10, 2026", checkOut: "May 11, 2026", phone: "09123456780", email: "juan@email.com", bookingRef: "BK-002" },
      { id: 3, name: "Dela Cruz, Ana", room: "Cottage A", status: "checked_in", checkIn: "May 10, 2026", checkOut: "May 12, 2026", phone: "09123456781", email: "ana@email.com", bookingRef: "BK-003" },
      { id: 4, name: "Lim, Carlos", room: "Cottage C", status: "due_out", checkIn: "May 9, 2026", checkOut: "May 11, 2026", phone: "09123456782", email: "carlos@email.com", bookingRef: "BK-004" }
    ],
    roomsList: [
      { id: 1, name: "Cottage A", status: "occupied", type: "cottage", price: 4800, capacity: 4 },
      { id: 2, name: "Cottage B", status: "available", type: "cottage", price: 4800, capacity: 4 },
      { id: 3, name: "Cottage C", status: "occupied", type: "cottage", price: 4800, capacity: 4 },
      { id: 4, name: "Cottage D", status: "occupied", type: "cottage", price: 5500, capacity: 5 },
      { id: 5, name: "Cottage E", status: "available", type: "cottage", price: 4800, capacity: 4 },
      { id: 6, name: "Cottage F", status: "maintenance", type: "cottage", price: 4800, capacity: 4 },
      { id: 7, name: "Dormitory 1", status: "occupied", type: "dormitory", price: 13000, capacity: 10 },
      { id: 8, name: "Dormitory 2", status: "available", type: "dormitory", price: 13000, capacity: 10 },
      { id: 9, name: "Villa Rosario", status: "available", type: "villa", price: 20000, capacity: 10 },
      { id: 10, name: "Casa Maria", status: "occupied", type: "single", price: 4800, capacity: 4 }
    ],
    };
  // End of data replacement

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const dismissNotification = (id) => {
    setDashboardData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }))
  }

  const handleCheckIn = (guest) => {
    setSelectedGuest(guest)
    setShowCheckInModal(true)
  }

  const handleCheckOut = async (guest) => {
    setSelectedGuest(guest)
    setPaymentMethod('cash')
    setReferenceNumber('')
    try {
      const billsRes = await api.get(`/bills/${guest.bookingRef}`).catch(()=>null);
      if (billsRes && billsRes.data) {
        setActualBill(billsRes.data);
      }
    } catch(e) {}
    setShowCheckOutModal(true)
  }

  const handleCompleteCheckIn = async () => {
    if (selectedGuest) {
      try {
        await api.post(`/checkin/${selectedGuest.bookingRef}`);
        await fetchData();
        alert(`Checked in ${selectedGuest.name} successfully!`);
        setShowCheckInModal(false);
        setSelectedGuest(null);
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data?.error || 'Error checking in');
      }
    }
  }

  const handleCompleteCheckOut = async () => {
    if (selectedGuest) {
      if (paymentMethod === 'gcash' && !referenceNumber) {
        alert("Please enter a GCash Reference Number.");
        return;
      }
      
      try {
        const billsRes = await api.get(`/bookings/${selectedGuest.bookingRef}/bill`).catch(()=>null);
        if(billsRes && billsRes.data) {
           let actualBill = billsRes.data;
           
           // Post any pending addons that the user selected in checkout modal
           const selectedAddons = addOns.filter(a => a.quantity > 0);
           for (const item of selectedAddons) {
              await api.post(`/bills/${actualBill.id}/items`, {
                 addon_id: item.id,
                 quantity: item.quantity
              });
           }
           
           // Re-fetch bill if addons were added
           if (selectedAddons.length > 0) {
              const updatedBillsRes = await api.get(`/bookings/${selectedGuest.bookingRef}/bill`);
              actualBill = updatedBillsRes.data;
           }

           if(actualBill.balance_due > 0) {
             await api.post('/payments', {
                bill_id: actualBill.id,
                amount_paid: actualBill.balance_due,
                payment_method: paymentMethod === 'credit_card' ? 'credit_card' : paymentMethod,
                reference_number: paymentMethod === 'gcash' ? referenceNumber : 'CASH-' + Date.now()
             });
           }
        }
        await api.post(`/checkout/${selectedGuest.bookingRef}`);
        await fetchData();
        
        // Print Receipt
        setTimeout(() => {
          window.print();
        }, 500);
        
        alert(`Checked out ${selectedGuest.name} successfully!`);
        setShowCheckOutModal(false);
        setSelectedGuest(null);
        setActualBill(null);
        setAddOns(addOns.map(a => ({ ...a, quantity: 0 })));
      } catch (e) {
        alert(e.response?.data?.message || e.response?.data?.error || 'Error checking out');
      }
    }
  }

  const handleRegisterWalkIn = async () => {
    try {
      const availableRoom = dashboardData.roomsList.find(r => r.status === 'available' && r.type?.toLowerCase().includes(walkInForm.roomType?.toLowerCase() || ''));
      const roomId = availableRoom ? availableRoom.id : dashboardData.roomsList.find(r => r.status === 'available')?.id;
      
      if (!roomId) {
        alert("No available rooms found!");
        return;
      }

      await api.post('/checkin/walk-in', {
         first_name: walkInForm.firstName,
         last_name: walkInForm.lastName,
         mobile: walkInForm.phone || 'N/A',
         city: 'N/A',
         room_id: roomId,
         check_out: new Date(new Date(walkInForm.checkInDate).getTime() + walkInForm.nights * 86400000).toISOString().split('T')[0],
         number_of_adults: walkInForm.guests
      });
      
      await fetchData();
      alert(`Walk-in guest ${walkInForm.firstName} ${walkInForm.lastName} registered successfully!`);
      setShowWalkInModal(false);
      setWalkInForm({
        firstName: '', lastName: '', email: '', phone: '', roomType: '', nights: 1, guests: 1, checkInDate: new Date().toISOString().split('T')[0], specialRequests: ''
      });
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.error || 'Error registering walk-in');
    }
  }

  const handleAddHouseRule = async () => {
    try {
      const description = `Violation: ${houseRuleEntry.ruleViolated} | Guest: ${houseRuleEntry.guestName} | Room: ${houseRuleEntry.room} | Desc: ${houseRuleEntry.description} | Action: ${houseRuleEntry.actionTaken}`;
      await api.post('/reports/log-activity', {
        action: 'house_rule_violation',
        description
      });
      alert('House rule violation logged successfully!')
      fetchData();
      setShowHouseRulesModal(false)
      setHouseRuleEntry({ guestName: '', room: '', ruleViolated: '', description: '', actionTaken: '' })
    } catch(e) {
      alert('Failed to log violation');
    }
  }

  const handleChargeToRoom = async () => {
    if (selectedGuest && chargeAmount) {
      try {
        const billsRes = await api.get(`/bookings/${selectedGuest.bookingRef}/bill`).catch(()=>null);
        if(billsRes && billsRes.data) {
           const customAddon = await api.get('/addons').then(res => res.data.find(a => a.addon_code === 'CUSTOM'));
           
           if (!customAddon) {
             alert('Custom Addon not configured in backend.');
             return;
           }

           await api.post(`/bills/${billsRes.data.id}/items`, {
             addon_id: customAddon.id,
             quantity: 1,
             custom_price: parseFloat(chargeAmount),
             notes: 'Custom charge added at front desk'
           });
           alert(`Charged ₱${chargeAmount} to ${selectedGuest.name}'s room successfully!`);
           setShowChargeModal(false);
           setSelectedGuest(null);
           setChargeAmount('');
           fetchData();
        } else {
           alert("No bill found for this guest.");
        }
      } catch (e) {
        alert('Failed to charge to room.');
      }
    }
  }

  const handleApplyDiscount = async () => {
    if (selectedGuest && discountId) {
      const pin = prompt("Enter Manager PIN to approve this discount:");
      if (pin !== "1234") {
        alert("Invalid Manager PIN. Discount approval failed.");
        return;
      }
      
      try {
        const billsRes = await api.get(`/bookings/${selectedGuest.bookingRef}/bill`).catch(()=>null);
        if (billsRes && billsRes.data) {
           await api.post(`/bills/${billsRes.data.id}/discounts`, { 
             discount_id: parseInt(discountId),
             approval_notes: 'Approved by manager via PIN'
           });
        }
        alert('Discount applied successfully with manager approval!');
        setShowDiscountModal(false);
        setSelectedGuest(null);
        setDiscountId('');
        fetchData();
      } catch (e) {
        alert('Failed to apply discount.');
      }
    }
  }

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
    if (room.status === 'occupied' && room.guest) {
      const guest = dashboardData.allGuests.find(g => g.name === room.guest)
      setSelectedGuest(guest)
      setShowGuestDetailsModal(true)
    }
  }

  const calculateTotalBill = () => {
    const roomTotal = selectedGuest?.bill || 
      dashboardData.roomsList.find(r => r.name === selectedGuest?.room)?.price || 4800
    const addOnsTotal = addOns.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return roomTotal + addOnsTotal
  }

  const updateAddOnQuantity = (id, quantity) => {
    setAddOns(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ))
  }

  const getFilteredReservations = () => {
    let filtered = dashboardData.reservations
    
    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(res => res.status === filterStatus)
    }
    
    const startIndex = (currentPage - 1) * entriesPerPage
    return filtered.slice(startIndex, startIndex + entriesPerPage)
  }

  const getFilteredRooms = () => {
    let filtered = dashboardData.roomsList
    
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => room.status === filterStatus)
    }
    
    return filtered
  }

  const renderReservationsTable = () => {
    const reservations = getFilteredReservations()
    const totalPages = Math.ceil(dashboardData.reservations.length / entriesPerPage)

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservations.map(res => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{res.bookingRef}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{res.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{res.guest}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{res.checkIn}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{res.checkOut}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      res.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {res.status === 'checked_in' ? 'Checked In' : 
                       res.status === 'due_out' ? 'Due Out' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedBooking(res)
                        setExpandedBooking(expandedBooking === res.id ? null : res.id)
                      }}
                      className="text-amber-600 hover:text-amber-800"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select 
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderRoomsTable = () => {
    const rooms = getFilteredRooms()
    
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRoomClick(room)}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{room.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{room.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{room.capacity} pax</td>
                  <td className="px-6 py-4 text-sm text-gray-500">₱{room.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      room.status === 'occupied' ? 'bg-green-100 text-green-700' :
                      room.status === 'available' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {room.status === 'occupied' ? 'Occupied' : 
                       room.status === 'available' ? 'Available' : 'Maintenance'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {room.status === 'occupied' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          const guest = dashboardData.allGuests.find(g => g.room === room.name)
                          handleCheckOut(guest)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <UserX size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-30 overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🌊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CoastaDesk</h1>
            <p className="text-xs text-gray-400">Front Desk System</p>
          </div>
        </div>
        <p className="text-xs text-amber-400">Staff • Front Desk</p>
      </div>

      <nav className="p-4 space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2">Main</div>
        <button 
          onClick={() => {
            setActiveTab('dashboard')
            setSelectedView(null)
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Operations</div>
        <button 
          onClick={() => setShowCheckInModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <UserCheck size={18} />
          Check-in
        </button>
        <button 
          onClick={() => setShowCheckOutModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <UserX size={18} />
          Check-out
        </button>
        <button 
          onClick={() => setShowWalkInModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <Plus size={18} />
          Walk-in registration
        </button>
        <button 
          onClick={() => {
            setActiveTab('reservations')
            setSelectedView(null)
            setSearchTerm('')
            setFilterStatus('all')
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <Calendar size={18} />
          Online Bookings
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Records & Billing</div>
        <button 
          onClick={() => setShowChargeModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <Receipt size={18} />
          Charge to Room
        </button>
        <button 
          onClick={() => setShowDiscountModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <Receipt size={18} />
          Apply SC/PWD
        </button>
        <button 
          onClick={() => {
            setActiveTab('reservations')
            setSelectedView(null)
            setSearchTerm('')
            setFilterStatus('all')
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'reservations' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <BookOpen size={18} />
          Reservations
        </button>
        <button 
          onClick={() => {
            setActiveTab('guests')
            setSelectedView(null)
            setSearchTerm('')
            setFilterStatus('all')
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Users size={18} />
          Guests
        </button>
        <button 
          onClick={() => {
            setActiveTab('rooms')
            setSelectedView(null)
            setSearchTerm('')
            setFilterStatus('all')
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <Home size={18} />
          Rooms
        </button>
        <button 
          onClick={() => setShowBillModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <Receipt size={18} />
          Billing
        </button>

        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">Compliance</div>
        <button 
          onClick={() => setShowHouseRulesModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
        >
          <ClipboardList size={18} />
          House rules log
        </button>
      </nav>
    </div>
  )

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <button 
              onClick={() => {
                setSelectedView('arrivals')
                setFilterStatus('pending')
              }}
              className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Arrivals today</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData.arrivalsToday.total}</p>
                  <p className="text-sm text-green-600 mt-1">{dashboardData.arrivalsToday.checkedIn} already checked in</p>
                </div>
                <UserCheck size={32} className="text-blue-500" />
              </div>
            </button>
            
            <button 
              onClick={() => {
                setSelectedView('departures')
                setFilterStatus('due_out')
              }}
              className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Departures today</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData.departuresToday.total}</p>
                  <p className="text-sm text-orange-600 mt-1">{dashboardData.departuresToday.pending} pending checkout</p>
                </div>
                <UserX size={32} className="text-yellow-500" />
              </div>
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('guests')
                setFilterStatus('checked_in')
              }}
              className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Guests on property</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData.guestsOnProperty}</p>
                  <p className="text-sm text-gray-500 mt-1">Real-time count</p>
                </div>
                <Users size={32} className="text-green-500" />
              </div>
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('rooms')
              }}
              className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Rooms occupied</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardData.roomsOccupied}/{dashboardData.totalRooms}</p>
                  <p className="text-sm text-gray-500 mt-1">{dashboardData.totalRooms - dashboardData.roomsOccupied} available</p>
                </div>
                <Home size={32} className="text-purple-500" />
              </div>
            </button>
          </div>

          {/* Quick Actions Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={() => setShowCheckInModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg py-3 px-4 font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <UserCheck size={20} />
              Check in guest
            </button>
            <button 
              onClick={() => setShowCheckOutModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg py-3 px-4 font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <UserX size={20} />
              Check out guest
            </button>
            <button 
              onClick={() => setShowWalkInModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg py-3 px-4 font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              New walk-in
            </button>
            <button 
              onClick={() => setShowBillModal(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg py-3 px-4 font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Receipt size={20} />
              Generate bill
            </button>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Arrivals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar size={20} className="text-amber-500" />
                  Incoming arrivals
                </h3>
                <button 
                  onClick={() => {
                    setSelectedView('arrivals')
                    setFilterStatus('pending')
                  }}
                  className="text-sm text-amber-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData.incomingArrivals.map((arrival) => (
                  <div key={arrival.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{arrival.name}</p>
                      <p className="text-sm text-gray-500">{arrival.room} · {arrival.guests} guests · {arrival.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full ${arrival.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {arrival.status === 'checked_in' ? 'Checked in' : 'Pending'}
                      </span>
                      {arrival.status === 'pending' && (
                        <button 
                          onClick={() => handleCheckIn(arrival)}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Check-outs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock size={20} className="text-amber-500" />
                  Pending check-outs
                </h3>
                <button 
                  onClick={() => {
                    setSelectedView('departures')
                    setFilterStatus('due_out')
                  }}
                  className="text-sm text-amber-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData.pendingCheckouts.map((checkout) => (
                  <div key={checkout.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{checkout.name}</p>
                      <p className="text-sm text-gray-500">{checkout.room} · Due {checkout.dueTime}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-sm px-2 py-1 rounded-full ${checkout.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {checkout.status === 'overdue' ? 'Overdue' : 'Pending'}
                      </span>
                      <button 
                        onClick={() => handleCheckOut(checkout)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Status Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Home size={20} className="text-amber-500" />
                Room status
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {dashboardData.roomStatus.map((room) => (
                  <button 
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                  >
                    <span className="font-medium text-gray-800">{room.name}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      room.status === 'occupied' ? 'bg-green-100 text-green-700' : 
                      room.status === 'available' ? 'bg-blue-100 text-blue-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {room.status === 'occupied' ? 'Occupied' : 
                       room.status === 'available' ? 'Available' : 'Maintenance'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-amber-500" />
                Notifications
              </h3>
              <div className="space-y-3">
                {dashboardData.notifications.map((note) => (
                  <div key={note.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                    <AlertCircle size={16} className={`mt-0.5 ${
                      note.type === 'urgent' ? 'text-red-500' : 
                      note.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{note.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                    </div>
                    <button 
                      onClick={() => dismissNotification(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )
    } else if (activeTab === 'reservations') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservations</h2>
          {renderReservationsTable()}
        </div>
      )
    } else if (activeTab === 'rooms') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Rooms Status</h2>
          {renderRoomsTable()}
        </div>
      )
    } else if (activeTab === 'guests') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Guests</h2>
          {renderReservationsTable()}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'dashboard' ? 'Dashboard' : 
                   activeTab === 'reservations' ? 'Reservations' :
                   activeTab === 'guests' ? 'Guests' : 'Rooms'}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString()}
                </p>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="font-medium text-gray-800">{userData?.firstName || 'Staff'} {userData?.lastName || 'User'}</p>
                    <p className="text-xs text-gray-500">Front Desk Staff</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-3 border-b">
                      <p className="font-medium text-gray-800">{userData?.firstName} {userData?.lastName}</p>
                      <p className="text-xs text-gray-500">{userData?.email || 'staff@costamarina.com'}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left">
                        <User size={16} />
                        My Account
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left">
                        <Settings size={16} />
                        Settings
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {(activeTab === 'reservations' || activeTab === 'guests') && (
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by guest name, booking #, or confirmation code..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="checked_in">Checked In</option>
                  <option value="due_out">Due Out</option>
                </select>
              </div>
            )}
            
            {activeTab === 'rooms' && (
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by room name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            )}
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Modals - Same as before, keeping them for brevity */}
      {/* Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">New Walk-in Guest Registration</h2>
              <button onClick={() => setShowWalkInModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">First Name *</label>
                    <input 
                      type="text" 
                      value={walkInForm.firstName}
                      onChange={(e) => setWalkInForm({...walkInForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      value={walkInForm.lastName}
                      onChange={(e) => setWalkInForm({...walkInForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      value={walkInForm.email}
                      onChange={(e) => setWalkInForm({...walkInForm, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Phone *</label>
                    <input 
                      type="tel" 
                      value={walkInForm.phone}
                      onChange={(e) => setWalkInForm({...walkInForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Room Type *</label>
                    <select 
                      value={walkInForm.roomType}
                      onChange={(e) => setWalkInForm({...walkInForm, roomType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    >
                      <option value="">Select room type</option>
                      <option value="cottage">Cottage (₱4,800/night)</option>
                      <option value="dormitory">Dormitory (₱13,000/night)</option>
                      <option value="villa">Villa (₱20,000/night)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Number of Nights</label>
                    <input 
                      type="number" 
                      min="1"
                      value={walkInForm.nights}
                      onChange={(e) => setWalkInForm({...walkInForm, nights: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Check-in Date</label>
                  <input 
                    type="date" 
                    value={walkInForm.checkInDate}
                    onChange={(e) => setWalkInForm({...walkInForm, checkInDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Special Requests</label>
                  <textarea 
                    value={walkInForm.specialRequests}
                    onChange={(e) => setWalkInForm({...walkInForm, specialRequests: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    placeholder="Any special requests or notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={handleRegisterWalkIn}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Register Guest
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Check-in Guest</h2>
              <button onClick={() => setShowCheckInModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Select Booking</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => {
                    const guest = dashboardData.incomingArrivals.find(g => g.id === parseInt(e.target.value))
                    setSelectedGuest(guest)
                  }}
                >
                  <option value="">Select booking reference</option>
                  {dashboardData.incomingArrivals.filter(a => a.status === 'pending').map(guest => (
                    <option key={guest.id} value={guest.id}>{guest.bookingRef} - {guest.name}</option>
                  ))}
                </select>
              </div>
              {selectedGuest && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium">{selectedGuest.name}</p>
                  <p className="text-sm text-gray-600">Room: {selectedGuest.room} · {selectedGuest.guests} guests</p>
                  <p className="text-sm text-gray-600">Booking: {selectedGuest.bookingRef}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={handleCompleteCheckIn}
                  disabled={!selectedGuest}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  Confirm Check-in
                </button>
                <button onClick={() => setShowCheckInModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check-out & Billing Modal */}
      {showCheckOutModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Check-out & Billing</h2>
              <button onClick={() => setShowCheckOutModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Guest Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">Guest: {selectedGuest.name}</p>
                  <p className="text-sm text-gray-600">Room: {selectedGuest.room}</p>
                  <p className="text-sm text-gray-600">Check-in: {selectedGuest.checkIn} | Check-out: {selectedGuest.checkOut}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Add-on Services</h3>
                <div className="space-y-2">
                  {addOns.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">₱{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateAddOnQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center"
                        >-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateAddOnQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room Charge:</span>
                    <span>₱{(actualBill ? actualBill.room_charge : 4800).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add-ons / Food:</span>
                    <span>₱{(actualBill ? actualBill.addons_charge : (calculateTotalBill() - 4800)).toLocaleString()}</span>
                  </div>
                  {actualBill && actualBill.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({actualBill.discount?.name}):</span>
                      <span>-₱{actualBill.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount Due:</span>
                    <span className="text-amber-600">₱{(actualBill ? actualBill.total_amount : calculateTotalBill()).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 border-t pt-4 print:hidden">
                <h3 className="font-semibold text-gray-800 mb-3">Payment Method</h3>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="payment" value="gcash" checked={paymentMethod === 'gcash'} onChange={() => setPaymentMethod('gcash')} />
                    <span>GCash</span>
                  </label>
                </div>
                {paymentMethod === 'gcash' && (
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg" 
                    placeholder="Enter GCash Reference Number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleCompleteCheckOut}
                  className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Complete Check-out & Print Bill
                </button>
                <button 
                  onClick={() => setShowCheckOutModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Generate Bill</h2>
              <button onClick={() => setShowBillModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Guest</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => {
                    const guest = dashboardData.allGuests.find(g => g.id === parseInt(e.target.value))
                    setSelectedGuest(guest)
                  }}
                >
                  <option value="">Select a guest</option>
                  {dashboardData.allGuests.filter(g => g.status === 'checked_in').map(guest => (
                    <option key={guest.id} value={guest.id}>{guest.name} - {guest.room}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Bill Type</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Final Bill (Check-out)</option>
                  <option>Interim Bill</option>
                  <option>Deposit Slip</option>
                </select>
              </div>
              {selectedGuest && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Guest: {selectedGuest.name}</p>
                  <p className="text-sm text-gray-600">Room: {selectedGuest.room}</p>
                  <p className="text-sm text-gray-600">Current bill estimate: ₱4800</p>
                </div>
              )}
              <button 
                onClick={() => {
                  alert(`Bill generated for ${selectedGuest?.name || 'guest'}`)
                  setShowBillModal(false)
                }}
                disabled={!selectedGuest}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* House Rules Log Modal */}
      {showHouseRulesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Log House Rule Violation</h2>
              <button onClick={() => setShowHouseRulesModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Guest Name *</label>
                  <input 
                    type="text"
                    value={houseRuleEntry.guestName}
                    onChange={(e) => setHouseRuleEntry({...houseRuleEntry, guestName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter guest name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Room/Cottage *</label>
                  <input 
                    type="text"
                    value={houseRuleEntry.room}
                    onChange={(e) => setHouseRuleEntry({...houseRuleEntry, room: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Room number or name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Rule Violated *</label>
                  <select 
                    value={houseRuleEntry.ruleViolated}
                    onChange={(e) => setHouseRuleEntry({...houseRuleEntry, ruleViolated: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select violation</option>
                    <option>Noise complaint after hours</option>
                    <option>Outside food/drinks</option>
                    <option>Unauthorized cooking equipment</option>
                    <option>Smoking in non-smoking area</option>
                    <option>Pets not allowed</option>
                    <option>Diving off wharf</option>
                    <option>Other violation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Description *</label>
                  <textarea 
                    value={houseRuleEntry.description}
                    onChange={(e) => setHouseRuleEntry({...houseRuleEntry, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Describe the incident..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Action Taken</label>
                  <textarea 
                    value={houseRuleEntry.actionTaken}
                    onChange={(e) => setHouseRuleEntry({...houseRuleEntry, actionTaken: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Warning issued, fine imposed, etc."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleAddHouseRule}
                    disabled={!houseRuleEntry.guestName || !houseRuleEntry.ruleViolated || !houseRuleEntry.description}
                    className="flex-1 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Log Violation
                  </button>
                  <button 
                    onClick={() => setShowHouseRulesModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-4">Recent Logs</h3>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {dashboardData.houseRulesLogs.map(log => (
                    <div key={log.id} className="p-3 border rounded bg-gray-50 text-sm">
                      <p className="font-medium text-gray-800">{log.action === 'house_rule_violation' ? 'Rule Violation' : 'System Action'}</p>
                      <p className="text-gray-600 mt-1">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'} • {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {dashboardData.houseRulesLogs.length === 0 && (
                    <p className="text-gray-500 text-center text-sm">No activity logs found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charge to Room Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Charge to Room</h2>
              <button onClick={() => setShowChargeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Guest</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => {
                    const guest = dashboardData.allGuests.find(g => g.id === parseInt(e.target.value))
                    setSelectedGuest(guest)
                  }}
                >
                  <option value="">Select a guest</option>
                  {dashboardData.allGuests.filter(g => g.status === 'checked_in').map(guest => (
                    <option key={guest.id} value={guest.id}>{guest.name} - {guest.room}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Amount (₱)</label>
                <input 
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <button 
                onClick={handleChargeToRoom}
                disabled={!selectedGuest || !chargeAmount}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Charge Amount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Request SC/PWD Discount</h2>
              <button onClick={() => setShowDiscountModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Guest</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => {
                    const guest = dashboardData.allGuests.find(g => g.id === parseInt(e.target.value))
                    setSelectedGuest(guest)
                  }}
                >
                  <option value="">Select a guest</option>
                  {dashboardData.allGuests.filter(g => g.status === 'checked_in').map(guest => (
                    <option key={guest.id} value={guest.id}>{guest.name} - {guest.room}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Discount Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  value={discountId}
                  onChange={(e) => setDiscountId(e.target.value)}
                >
                  <option value="">Select Discount</option>
                  <option value="1">Senior Citizen (20%)</option>
                  <option value="2">PWD (20%)</option>
                </select>
              </div>
              <button 
                onClick={handleApplyDiscount}
                disabled={!selectedGuest || !discountId}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                Request Manager Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Details Modal */}
      {showGuestDetailsModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Guest Details</h2>
              <button onClick={() => setShowGuestDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={40} className="text-white" />
                </div>
                <h3 className="font-bold text-lg">{selectedGuest.name}</h3>
                <p className="text-sm text-gray-500">Room: {selectedGuest.room}</p>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-gray-400" />
                  <span>{selectedGuest.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-gray-400" />
                  <span>{selectedGuest.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon size={14} className="text-gray-400" />
                  <span>Check-in: {selectedGuest.checkIn || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon size={14} className="text-gray-400" />
                  <span>Check-out: {selectedGuest.checkOut || 'N/A'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setShowGuestDetailsModal(false)
                    handleCheckOut(selectedGuest)
                  }}
                  className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                >
                  Check Out
                </button>
                <button 
                  onClick={() => setShowGuestDetailsModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Close
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