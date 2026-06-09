import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function UserModal({ isOpen, onClose, onSave, user }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset(user || { first_name: '', last_name: '', email: '', password: '', role: 'staff', is_blocked: false });
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">First Name</label>
              <input 
                type="text" 
                {...register('first_name', { required: 'First name is required' })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.first_name ? 'border-red-500' : ''}`} 
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Last Name</label>
              <input 
                type="text" 
                {...register('last_name', { required: 'Last name is required' })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.last_name ? 'border-red-500' : ''}`} 
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input 
              type="email" 
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
              })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`} 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          {!user && (
            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input 
                type="password" 
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`w-full px-3 py-2 border rounded-lg ${errors.password ? 'border-red-500' : ''}`} 
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              {...register('role')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          {user && (
            <div className="flex items-center mt-6">
              <input 
                type="checkbox" 
                id="is_blocked" 
                {...register('is_blocked')}
                className="mr-2" 
              />
              <label htmlFor="is_blocked" className="text-gray-700 font-medium">Block Account (Cannot login)</label>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary">
              {user ? 'Update User' : 'Save User'}
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
