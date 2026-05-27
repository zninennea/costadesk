const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'resources', 'js', 'pages', 'dashboard', 'StaffDashboard.jsx');
let content = fs.readFileSync(target, 'utf8');

// 1. Add api import
content = content.replace("import { useNavigate } from 'react-router-dom'", "import { useNavigate } from 'react-router-dom'\nimport api from '../../api'");

// 2. Replace useEffect and dashboardData state
const oldStateBlock = `  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sample data (would come from API in production)
  const [dashboardData, setDashboardData] = useState({`;

const newStateBlock = `  const [dashboardData, setDashboardData] = useState({
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
      const incoming = bookings.filter(b => b.status === 'pending' && b.check_in <= today);
      const checkouts = bookings.filter(b => b.status === 'checked_in' && b.check_out <= today);
      const checkedIn = bookings.filter(b => b.status === 'checked_in');

      setDashboardData({
        arrivalsToday: { total: incoming.length, checkedIn: 0, list: incoming.map(b => ({ id: b.id, name: b.user?.first_name + ' ' + b.user?.last_name, room: b.room?.room_number, roomId: b.room_id, guests: 1, time: b.check_in, status: b.status, bookingRef: b.id, phone: b.user?.phone || 'N/A', email: b.user?.email })) },
        departuresToday: { total: checkouts.length, pending: checkouts.length, list: checkouts.map(b => ({ id: b.id, name: b.user?.first_name + ' ' + b.user?.last_name, room: b.room?.room_number, roomId: b.room_id, dueTime: "12:00 PM", status: "pending", bill: b.total_price })) },
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
                guestName = b.user?.first_name + ' ' + b.user?.last_name;
                guestId = b.id;
                chkIn = b.check_in;
                chkOut = b.check_out;
             }
           }
           return { id: r.id, name: "Room " + r.room_number, status: r.status, type: r.category?.name, guest: guestName, guestId: guestId, checkIn: chkIn, checkOut: chkOut };
        }),
        incomingArrivals: incoming.map(b => ({ id: b.id, name: b.user?.first_name + ' ' + b.user?.last_name, room: b.room?.room_number, roomId: b.room_id, guests: 1, time: "3:00 PM", status: b.status, bookingRef: b.id, phone: b.user?.phone || 'N/A', email: b.user?.email })),
        pendingCheckouts: checkouts.map(b => ({ id: b.id, name: b.user?.first_name + ' ' + b.user?.last_name, room: b.room?.room_number, roomId: b.room_id, dueTime: "12:00 PM", status: "pending", bill: b.total_price })),
        notifications: [],
        reservations: bookings.map(b => ({ id: b.id, bookingRef: b.id, code: "CMB-"+b.id, guest: b.user?.first_name + ' ' + b.user?.last_name, checkIn: b.check_in, checkOut: b.check_out, status: b.status, room: b.room?.room_number, guests: 1, amount: b.total_price })),
        allGuests: checkedIn.map(b => ({ id: b.id, name: b.user?.first_name + ' ' + b.user?.last_name, room: b.room?.room_number, status: b.status, checkIn: b.check_in, checkOut: b.check_out, phone: b.user?.phone || 'N/A', email: b.user?.email, bookingRef: b.id })),
        roomsList: rooms.map(r => ({ id: r.id, name: "Room " + r.room_number, status: r.status, type: r.category?.name, price: r.category?.base_price, capacity: r.category?.capacity })),
        houseRulesLogs: []
      });
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
  const mockDataPlaceholder = {`;

content = content.replace(oldStateBlock, newStateBlock);

// Remove the rest of the massive hardcoded object
const hardcodedEnd = `houseRulesLogs: [
      { id: 1, guestName: "Lim, Carlos", room: "Cottage C", ruleViolated: "Noise complaint", description: "Excessive noise after 10 PM", actionTaken: "Verbal warning", loggedBy: "M. Santos", date: "May 10, 2026", time: "9:42 PM" }
    ]
  })`;

content = content.replace(hardcodedEnd, "};\n  // End of data replacement");


// 3. Replace Action Handlers
const handleCheckInRegex = /const handleCompleteCheckIn = \(\) => {[\s\S]*?setShowCheckInModal\(false\)\s+setSelectedGuest\(null\)\s+}\s+}/;

const newHandleCheckIn = `const handleCompleteCheckIn = async () => {
    if (selectedGuest) {
      try {
        await api.put(\`/bookings/\${selectedGuest.bookingRef}\`, { status: 'checked_in' });
        await fetchData();
        alert(\`Checked in \${selectedGuest.name} successfully!\`);
        setShowCheckInModal(false);
        setSelectedGuest(null);
      } catch (e) {
        alert(e.response?.data?.message || 'Error checking in');
      }
    }
  }`;

content = content.replace(handleCheckInRegex, newHandleCheckIn);

const handleCheckOutRegex = /const handleCompleteCheckOut = \(\) => {[\s\S]*?setSelectedGuest\(null\)\s+setAddOns\(addOns.map\(a => \({ \.\.\.a, quantity: 0 }\)\)\)\s+}\s+}/;

const newHandleCheckOut = `const handleCompleteCheckOut = async () => {
    if (selectedGuest) {
      try {
        // Find bill and process payment
        const billsRes = await api.get(\`/bills/\${selectedGuest.bookingRef}\`).catch(()=>null);
        if(billsRes && billsRes.data) {
           await api.post('/payments', {
              bill_id: billsRes.data.id,
              amount: calculateTotalBill(),
              method: 'cash',
              reference_number: 'CASH-' + Date.now()
           });
        }
        await api.put(\`/bookings/\${selectedGuest.bookingRef}\`, { status: 'completed' });
        await fetchData();
        alert(\`Checked out \${selectedGuest.name} successfully! Total bill: ₱\${calculateTotalBill().toLocaleString()}\`);
        setShowCheckOutModal(false);
        setSelectedGuest(null);
        setAddOns(addOns.map(a => ({ ...a, quantity: 0 })));
      } catch (e) {
        alert(e.response?.data?.message || 'Error checking out');
      }
    }
  }`;

content = content.replace(handleCheckOutRegex, newHandleCheckOut);

fs.writeFileSync(target, content);
console.log('Retrofit StaffDashboard complete');
