import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function RoomModal({ isOpen, onClose, onSave, room, categories }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset(room || { room_number: '', name: '', description: '', room_category_id: '', status: 'available' });
    }
  }, [isOpen, room, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{room ? 'Edit Room' : 'Add New Room'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Room Number</label>
              <input 
                type="text" 
                {...register('room_number', { required: 'Room number is required' })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.room_number ? 'border-red-500' : ''}`} 
              />
              {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name / Identifier</label>
              <input 
                type="text" 
                {...register('name')}
                className="w-full px-3 py-2 border rounded-lg" 
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <select 
              {...register('room_category_id', { required: 'Category is required' })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.room_category_id ? 'border-red-500' : ''}`}
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} - ₱{c.base_price}</option>
              ))}
            </select>
            {errors.room_category_id && <p className="text-red-500 text-xs mt-1">{errors.room_category_id.message}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea 
              {...register('description')}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            ></textarea>
          </div>
          {room && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">Status</label>
              <select 
                {...register('status')}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary">
              {room ? 'Update Room' : 'Save Room'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
