import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ReservationModal({ isOpen, onClose, onSave, rooms }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      mobile: '',
      city: '',
      room_id: '',
      check_in: '',
      check_out: '',
      number_of_adults: 1,
      special_requests: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        first_name: '',
        last_name: '',
        mobile: '',
        city: '',
        room_id: '',
        check_in: new Date().toISOString().split('T')[0],
        check_out: '',
        number_of_adults: 1,
        special_requests: ''
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create New Reservation</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">First Name *</label>
                <input 
                  type="text" 
                  {...register('first_name', { required: 'First name is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.first_name ? 'border-red-500' : ''}`}
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Last Name *</label>
                <input 
                  type="text" 
                  {...register('last_name', { required: 'Last name is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.last_name ? 'border-red-500' : ''}`}
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  {...register('mobile', { required: 'Phone number is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.mobile ? 'border-red-500' : ''}`}
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">City/Address</label>
                <input 
                  type="text" 
                  {...register('city')}
                  className="w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Select Room *</label>
                <select 
                  {...register('room_id', { required: 'Room is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.room_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Choose a room...</option>
                  {rooms?.map(room => (
                    <option key={room.id} value={room.id}>Room {room.room_number} ({room.category?.name})</option>
                  ))}
                </select>
                {errors.room_id && <p className="text-red-500 text-xs mt-1">{errors.room_id.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Number of Guests *</label>
                <input 
                  type="number" 
                  min="1"
                  {...register('number_of_adults', { 
                    required: 'Number of guests is required',
                    min: { value: 1, message: 'Minimum 1 guest' }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.number_of_adults ? 'border-red-500' : ''}`}
                />
                {errors.number_of_adults && <p className="text-red-500 text-xs mt-1">{errors.number_of_adults.message}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Check-in Date *</label>
                <input 
                  type="date" 
                  {...register('check_in', { required: 'Check-in date is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.check_in ? 'border-red-500' : ''}`}
                />
                {errors.check_in && <p className="text-red-500 text-xs mt-1">{errors.check_in.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Check-out Date *</label>
                <input 
                  type="date" 
                  {...register('check_out', { required: 'Check-out date is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.check_out ? 'border-red-500' : ''}`}
                />
                {errors.check_out && <p className="text-red-500 text-xs mt-1">{errors.check_out.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Special Requests</label>
              <textarea 
                {...register('special_requests')}
                rows="2"
                className="w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Any special requests or notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="submit"
                className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create Confirmed Reservation
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
