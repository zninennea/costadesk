import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home, Tag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    room_number: '',
    room_category_id: '',
    status: 'available',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, catsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/categories')
      ]);
      setRooms(roomsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setFormData({
      id: room.id,
      room_number: room.room_number,
      room_category_id: room.room_category_id,
      status: room.status,
      image_url: room.image_url || ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting room');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/rooms/${formData.id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      setIsEditing(false);
      setFormData({ id: null, room_number: '', room_category_id: '', status: 'available', image_url: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving room');
    }
  };

  if (loading) return <div>Loading room data...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 max-w-6xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <Home className="text-amber-500 w-8 h-8" />
          <h2 className="text-2xl font-bold text-gray-800">Property Management</h2>
        </div>
        <button 
          onClick={() => {
            setIsEditing(true);
            setFormData({ id: null, room_number: '', room_category_id: categories[0]?.id || '', status: 'available', image_url: '' });
          }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-2"
        >
          <Plus size={18} /> Add Room
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Left Side: Room List */}
        <div className="md:col-span-3">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
             <Home size={18} />
             All Rooms
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  <th className="p-3 font-semibold">Room #</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Price/Night</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-800">{room.room_number}</td>
                    <td className="p-3 text-gray-600">{room.category?.name}</td>
                    <td className="p-3 text-gray-600">₱{room.category?.base_price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        room.status === 'available' ? 'bg-green-100 text-green-700' : 
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEdit(room)} className="text-amber-500 hover:text-amber-700 mr-3">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(room.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No rooms found. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Room Categories Summary / Form */}
        <div>
          {isEditing ? (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-4">{formData.id ? 'Edit Room' : 'Add New Room'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-amber-900 block mb-1">Room Number</label>
                  <input 
                    type="text" required
                    value={formData.room_number}
                    onChange={e => setFormData({...formData, room_number: e.target.value})}
                    className="w-full border border-amber-300 rounded p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-amber-900 block mb-1">Category</label>
                  <select 
                    required
                    value={formData.room_category_id}
                    onChange={e => setFormData({...formData, room_category_id: e.target.value})}
                    className="w-full border border-amber-300 rounded p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (₱{c.base_price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-amber-900 block mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-amber-300 rounded p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded font-medium hover:bg-amber-700">Save</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                 <Tag size={18} />
                 Categories
              </h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center font-bold text-gray-800">
                      <span>{cat.name}</span>
                      <span className="text-amber-600">₱{cat.base_price}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Capacity: {cat.capacity} persons</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
