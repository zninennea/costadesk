import React, { useState, useEffect } from 'react';
import { Home, Grid, RefreshCw } from 'lucide-react';
import api from '../api';

export default function RoomStatusBoard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
     setLoading(true);
     try {
        const res = await api.get('/rooms');
        setRooms(res.data);
     } catch(e) {
        console.error(e);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
     fetchRooms();
  }, []);

  const changeStatus = async (id, newStatus) => {
     try {
         await api.put(`/rooms/${id}`, { status: newStatus });
         fetchRooms();
     } catch (e) {
         console.error(e);
     }
  };

  const getStatusColor = (status) => {
     switch(status) {
        case 'available': return 'bg-green-100 border-green-300 text-green-800';
        case 'occupied': return 'bg-blue-100 border-blue-300 text-blue-800';
        case 'maintenance': return 'bg-red-100 border-red-300 text-red-800';
        default: return 'bg-gray-100 border-gray-300 text-gray-800';
     }
  };

  return (
     <div className="bg-white p-6 rounded-xl shadow border border-gray-100 max-w-6xl mx-auto mt-4">
       <div className="flex items-center justify-between mb-6 border-b pb-4">
         <div className="flex items-center gap-3">
           <Grid className="text-amber-500 w-8 h-8" />
           <h2 className="text-2xl font-bold text-gray-800">Room Status Board</h2>
         </div>
         <button onClick={fetchRooms} className="text-gray-500 hover:text-amber-500 transition" title="Refresh">
           <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
         </button>
       </div>
       
       {loading && rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading rooms...</div>
       ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map(room => (
                <div key={room.id} className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${getStatusColor(room.status)}`}>
                  <Home className="w-8 h-8 mb-2 opacity-80" />
                  <span className="font-bold text-xl block">{room.room_number}</span>
                  <span className="text-xs uppercase font-semibold opacity-70 mb-3">{room.category?.name}</span>
                  <select 
                    value={room.status} 
                    onChange={(e) => changeStatus(room.id, e.target.value)}
                    className="text-xs w-full bg-white/50 border-0 rounded p-1 font-medium focus:ring-0 cursor-pointer text-center"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
            ))}
          </div>
       )}
     </div>
  );
}
