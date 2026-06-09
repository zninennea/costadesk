import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function WalkInModal({ isOpen, onClose, onSave, categories }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roomType: '',
      nights: 1,
      guests: 1,
      checkInDate: new Date().toISOString().split('T')[0],
      specialRequests: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roomType: '',
        nights: 1,
        guests: 1,
        checkInDate: new Date().toISOString().split('T')[0],
        specialRequests: ''
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">New Walk-in Guest Registration</h2>
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
                  {...register('firstName', { required: 'First name is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Last Name *</label>
                <input 
                  type="text" 
                  {...register('lastName', { required: 'Last name is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  {...register('email')}
                  className="w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  {...register('phone', { required: 'Phone number is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Room Type *</label>
                <select 
                  {...register('roomType', { required: 'Room type is required' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.roomType ? 'border-red-500' : ''}`}
                >
                  <option value="">Select room type</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name} (₱{c.base_price}/night)</option>
                  ))}
                </select>
                {errors.roomType && <p className="text-red-500 text-xs mt-1">{errors.roomType.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Number of Nights *</label>
                <input 
                  type="number" 
                  min="1"
                  {...register('nights', { 
                    required: 'Number of nights is required',
                    min: { value: 1, message: 'Minimum 1 night' }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.nights ? 'border-red-500' : ''}`}
                />
                {errors.nights && <p className="text-red-500 text-xs mt-1">{errors.nights.message}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Number of Guests *</label>
                <input 
                  type="number" 
                  min="1"
                  {...register('guests', { 
                    required: 'Number of guests is required',
                    min: { value: 1, message: 'Minimum 1 guest' }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.guests ? 'border-red-500' : ''}`}
                />
                {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Check-in Date</label>
                <input 
                  type="date" 
                  {...register('checkInDate')}
                  className="w-full px-3 py-2 border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Special Requests</label>
              <textarea 
                {...register('specialRequests')}
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
                Register Guest
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
