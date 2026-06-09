import React, { useState, useEffect } from 'react';
import { Home, Grid, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api';

export default function RoomStatusBoard() {
   const [rooms, setRooms] = useState([]);
   const [loading, setLoading] = useState(true);
   const [lastUpdated, setLastUpdated] = useState(new Date());

   const fetchRooms = async () => {
      setLoading(true);
      try {
         const res = await api.get('/rooms');
         setRooms(res.data);
         setLastUpdated(new Date());
      } catch (e) {
         console.error('Failed to fetch rooms', e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchRooms();
      // Poll every 10 seconds for real-time updates
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
   }, []);

   const changeStatus = async (id, newStatus) => {
      try {
         await api.put(`/rooms/${id}`, { status: newStatus });
         fetchRooms(); // Refresh after update
      } catch (e) {
         console.error('Failed to update room status', e);
         alert('Error updating room status');
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'available': return 'bg-green-100 border-green-300 text-green-800';
         case 'occupied': return 'bg-blue-100 border-blue-300 text-blue-800';
         case 'maintenance': return 'bg-red-100 border-red-300 text-red-800';
         case 'cleaning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
         case 'reserved': return 'bg-purple-100 border-purple-300 text-purple-800';
         default: return 'bg-neutral-100 border-neutral-300 text-neutral-800';
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case 'available': return '🟢';
         case 'occupied': return '🔴';
         case 'maintenance': return '⚠️';
         case 'cleaning': return '🧹';
         case 'reserved': return '📅';
         default: return '❓';
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
         <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
               <Grid className="text-primary-600 w-6 h-6" />
               <h2 className="text-xl font-bold text-neutral-800">Room Status Board</h2>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-xs text-neutral-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
               </span>
               <button
                  onClick={fetchRooms}
                  className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition"
                  title="Refresh"
               >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
               </button>
            </div>
         </div>

         {/* Legend */}
         <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span><span className="text-sm">Available</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span><span className="text-sm">Occupied</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span><span className="text-sm">Cleaning</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span><span className="text-sm">Maintenance</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full"></span><span className="text-sm">Reserved</span></div>
         </div>

         {/* Room Grid */}
         {loading && rooms.length === 0 ? (
            <div className="text-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
               <p className="text-neutral-500 mt-4">Loading rooms...</p>
            </div>
         ) : rooms.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
               <AlertCircle size={48} className="text-neutral-300 mx-auto mb-3" />
               <p className="text-neutral-500">No rooms found</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {rooms.map(room => (
                  <div
                     key={room.id}
                     className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all hover:shadow-md ${getStatusColor(room.status)}`}
                  >
                     <div className="text-2xl mb-2">{getStatusIcon(room.status)}</div>
                     <span className="font-bold text-lg block">{room.room_number}</span>
                     <span className="text-xs uppercase font-semibold opacity-70 mb-2">{room.category?.name || 'Room'}</span>
                     <select
                        value={room.status}
                        onChange={(e) => changeStatus(room.id, e.target.value)}
                        className="text-xs w-full bg-white/70 border-0 rounded-md p-1 font-medium focus:ring-1 focus:ring-primary-500 cursor-pointer text-center"
                     >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Reserved</option>
                     </select>
                  </div>
               ))}
            </div>
         )}

         {/* Summary */}
         <div className="mt-6 pt-4 border-t border-neutral-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-sm">
               <div><span className="font-semibold">Available:</span> {rooms.filter(r => r.status === 'available').length}</div>
               <div><span className="font-semibold">Occupied:</span> {rooms.filter(r => r.status === 'occupied').length}</div>
               <div><span className="font-semibold">Cleaning:</span> {rooms.filter(r => r.status === 'cleaning').length}</div>
               <div><span className="font-semibold">Maintenance:</span> {rooms.filter(r => r.status === 'maintenance').length}</div>
               <div><span className="font-semibold">Reserved:</span> {rooms.filter(r => r.status === 'reserved').length}</div>
            </div>
         </div>
      </div>
   );
}