import { useState } from 'react'
import { Bed, Users, DollarSign, Calendar, X, CheckCircle, AlertCircle, Phone, BookOpen, ExternalLink } from 'lucide-react'

const RoomCard = ({ room, type, onBookNow }) => {
  const [showModal, setShowModal] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [additionalHeads, setAdditionalHeads] = useState(0)
  const [showRules, setShowRules] = useState(false)

  // Map API fields to UI fields
  const roomName = room.name || `Room ${room.room_number}`
  const roomPrice = parseFloat(room.price || room.category?.base_price || 0)
  const roomCapacity = room.capacity || room.category?.capacity || 2
  const minHeads = room.min_heads || 2

  const calculateTotal = () => {
    let total = roomPrice
    if (additionalHeads > 0) {
      total += additionalHeads * 1500
    }
    return total
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
        {/* Image Placeholder */}
        <div className="h-56 bg-gradient-to-br from-amber-400 to-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Bed size={60} className="text-white/40 group-hover:scale-125 transition-transform duration-500" />
          </div>
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {type}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{roomName}</h3>
          <p className="text-gray-500 text-sm mb-3">Costa Marina Beach Resort</p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-amber-600">
              <DollarSign size={18} />
              <span className="font-bold text-lg">₱{roomPrice.toLocaleString()}</span>
              <span className="text-xs text-gray-500">/night</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users size={18} />
              <span className="text-sm">Good for {roomCapacity} Pax</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Room Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{roomName}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Gallery Placeholder */}
              <div className="mb-6">
                <div className="h-64 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">[Room Gallery Images Placeholder]</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Details */}
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Features and Inclusions</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">✓ 1 Bedroom</li>
                      <li className="flex items-center gap-2">✓ 2 Single Beds</li>
                      <li className="flex items-center gap-2">✓ 1 Toilet & Bath</li>
                      <li className="flex items-center gap-2">✓ Hot & Cold Shower</li>
                      <li className="flex items-center gap-2">✓ Free Breakfast</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Room Location</h3>
                    <p className="text-gray-600">Hillside overlooking the resort</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Capacity Details</h3>
                    <p className="text-gray-600 mb-2">Good for {roomCapacity} Pax</p>
                    <p className="text-sm text-gray-500">
                      Minimum {minHeads} pax are inclusive. Additional heads will be charged ₱1,500/person/night.
                    </p>
                    {roomCapacity > minHeads && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-gray-700">Additional Guests:</label>
                        <select 
                          value={additionalHeads}
                          onChange={(e) => setAdditionalHeads(parseInt(e.target.value))}
                          className="ml-2 px-2 py-1 border rounded-lg"
                        >
                          {[...Array(roomCapacity - minHeads + 1)].map((_, i) => (
                            <option key={i} value={i}>{i} person(s)</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Column - Booking */}
                <div>
                  <div className="bg-amber-50 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-lg mb-3">Book this room</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Check-in:</label>
                        <input 
                          type="date" 
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Check-out:</label>
                        <input 
                          type="date" 
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between mb-2">
                          <span>Rate per night:</span>
                          <span className="font-semibold">₱{roomPrice.toLocaleString()}</span>
                        </div>
                        {additionalHeads > 0 && (
                          <div className="flex justify-between mb-2 text-sm text-gray-600">
                            <span>Additional guests ({additionalHeads} × ₱1,500):</span>
                            <span>₱{(additionalHeads * 1500).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span className="text-amber-600">₱{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onBookNow(room.id, checkIn, checkOut, calculateTotal())}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                      <span>No bringing of food, drinks, and liquors.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                      <span>No grilling allowed.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                      <span>Strictly no pets allowed.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                      <span>No cancellation of booking and no refund.</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-amber-500" />
                    <span className="text-sm">+63 917-7958-372</span>
                    <button className="text-amber-600 text-sm font-medium hover:underline ml-4">
                      Need help? GET STARTED
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowRules(!showRules)}
                    className="text-amber-600 text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <BookOpen size={16} />
                    Read Rules & Regulations
                  </button>
                </div>
                
                {showRules && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-3">House Rules & Safety Measures</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      For us to serve you better, we wish to inform you of our house rules and safety measures. 
                      We request your cooperation and compliance to make your stay safe and memorable.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ <strong>NO CONFIRMED BOOKING – NO ENTRY</strong> - Day tour and overnight guests must book and pay in advance with a strict "NO CANCELLATION POLICY." Rebooking is allowed only once and must be coordinated and confirmed with the office.</li>
                      <li>✓ Each guest is required to present 1 valid ID. For toddlers and kids, a birth certificate is required.</li>
                      <li>✓ The management is not liable for any loss or damage to your valuables and personal effects.</li>
                      <li>✓ Children and toddlers must be accompanied by adults at all times.</li>
                      <li>✓ Rice cookers, electric stoves, butane stoves, or any flammable appliances are not allowed within the premises.</li>
                      <li>✓ To avoid any accidents, horseplay and diving off from the wharf are strictly prohibited.</li>
                      <li>✓ Hammocks and tents are not allowed without prior arrangements and approval.</li>
                      <li>✓ Bringing of PETS IS STRICTLY NOT ALLOWED.</li>
                      <li>✓ Firearms, illegal drugs and gambling are strictly prohibited</li>
                      <li>✓ Fishing is not allowed within the boundaries of the resort.</li>
                      <li>✓ Appropriate energy charges will apply to any electrical appliance brought to the resort.</li>
                      <li>✓ Damage(s) or loss of resort property by the customer shall be charged accordingly.</li>
                      <li>✓ Smoking is only allowed at the designated smoking areas.</li>
                      <li>✓ The bringing of food, beverages, and liquor is not allowed.</li>
                      <li>✓ The use of jet skis and windsurfing within the swimming areas is strictly prohibited.</li>
                      <li>✓ Please conserve water and electricity.</li>
                      <li>✓ Wearing of face masks is still required.</li>
                      <li>✓ Social distancing from other guests must be maintained at all times.</li>
                      <li>✓ Please wear aqua shoes or rubber slippers at the swimming area.</li>
                      <li>✓ Washing of hands and sanitizing should always be done.</li>
                      <li>✓ The resort has the right to refuse entry and turn away guests for unbecoming behavior.</li>
                      <li>✓ And lastly, you are required to ENJOY and HAVE FUN!</li>
                    </ul>
                    <p className="mt-3 text-center font-semibold">We wish you a pleasant stay!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RoomCard