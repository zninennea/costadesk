import { useState } from 'react'
import { Wind, Music, Volleyball, Sun, Clock, Users, Coffee, Utensils, Pizza, Coffee as CoffeeIcon, Beer, Wine } from 'lucide-react'

function ActivitiesPage() {
  const [activeMenuCategory, setActiveMenuCategory] = useState('breakfast')

  const activities = [
    { icon: Wind, title: "Water Sports", items: ["Jet Ski", "Banana Boat"], color: "from-blue-500 to-cyan-400", description: "Experience thrilling water adventures" },
    { icon: Music, title: "Karaoke", items: ["Available for rent"], color: "from-purple-500 to-pink-500", description: "Sing your heart out with family and friends" },
    { icon: Volleyball, title: "Sports", items: ["Beach Volleyball", "Billiard", "Darts"], color: "from-green-500 to-emerald-500", description: "Stay active with our sports facilities" },
    { icon: Sun, title: "Day Tour", items: ["6:30 AM - 4:00 PM", "₱350/adult", "₱250/child (4-10 yrs)"], color: "from-yellow-500 to-orange-500", description: "Perfect for a day of fun in the sun" }
  ]

  const menuCategories = {
    breakfast: {
      title: "Breakfast (Until 9 AM) w/ Rice",
      icon: Coffee,
      items: [
        { name: "Bacon w/ egg", price: 250 },
        { name: "Omelet", price: 190 },
        { name: "Scrambled or Sunny Side-up", price: 150 },
        { name: "Fried Dried Fish w/ Salted egg & Tomato", price: 290 },
        { name: "Chicken Tapa", price: 290 },
        { name: "Beef Tapa", price: 310 },
        { name: "Corned Beef w/ Potato", price: 310 },
        { name: "Daing na Bangus", price: 400 },
        { name: "Grilled or Fried Longganisa", price: 290 },
        { divider: true, title: "Noodles" },
        { name: "Bihon or Canton Guisado (Chicken or Pork)", price: 300 },
        { name: "Bihon or Canton Guisado (Seafoods)", price: 330 },
        { divider: true, title: "Rice (per cup)" },
        { name: "Plain Rice", price: 35 },
        { name: "Garlic Rice", price: 50 }
      ]
    },
    lunchDinner: {
      title: "Lunch & Dinner",
      icon: Utensils,
      items: [
        { divider: true, title: "Pork" },
        { name: "Binagoongang Baboy", price: 370 },
        { name: "Chicharon Bulaklak", price: 330 },
        { name: "Crispy Pata", price: 750 },
        { name: "Grilled Liempo", price: 290 },
        { name: "Grilled Pork Chop", price: 290 },
        { name: "Grilled Spare Ribs", price: 290 },
        { name: "Lechon Kawali", price: 430 },
        { name: "Lumpiang Shanghai (8 rolls)", price: 260 },
        { name: "Pork Adobo", price: 300 },
        { name: "Pork Afritada", price: 330 },
        { name: "Pork BBQ (4 Stick)", price: 290 },
        { name: "Pork Tocino", price: 290 },
        { name: "Costa Marina Express", price: 330 },
        { name: "Sizzling Sisig", price: 350 },
        { divider: true, title: "Poultry" },
        { name: "Battered Chicken", price: 450 },
        { name: "Chicken Adobo", price: 290 },
        { name: "Chicken Afritada", price: 300 },
        { name: "Chicken BBQ", price: 220 },
        { name: "Fried Chicken", price: 370 },
        { divider: true, title: "Beef" },
        { name: "Beef Caldereta", price: 500 },
        { name: "Beef Steak (Tagalog)", price: 510 },
        { name: "Beef Steak: Imported (Rib Eye/ Porter House/ T-Bone)", price: 650 },
        { divider: true, title: "Seafoods" },
        { name: "Fish Fillet (Malasugue)", price: 460 },
        { name: "Fried Shrimp", price: 550 },
        { name: "Pompano (Fried/Steamed/Paksiw)", price: 700 },
        { name: "Grilled Malasugue", price: 450 },
        { name: "Imperial Tempura", price: 800 },
        { name: "Kinilaw (Malasugue)", price: 470 },
        { name: "Sashimi (Malasugue)", price: 440 },
        { name: "Steamed Hipon", price: 550 },
        { name: "Spicy Shrimp w/ Kangkong", price: 560 },
        { divider: true, title: "Seasonal (Price/Gram)" },
        { name: "Kitang (Grilled)", pricePerGram: 2.25, minGrams: 300 },
        { name: "Palid (Grilled)", pricePerGram: 2.25, minGrams: 300 },
        { name: "Lapu-Lapu (Grilled/Fried/Steamed/Sweet and Sour)", pricePerGram: 2.50, minGrams: 300 },
        { name: "Grilled Bangus (Grilled/Sinigang/Daing/Sisig/Paksiw)", pricePerGram: 1.85, minGrams: 400 },
        { name: "Squid (Calamares/Grilled/Adobo/Sizzling)", pricePerGram: 2.25, minGrams: 400 },
        { name: "Grilled Tuna Belly", pricePerGram: 1.85, minGrams: 500 },
        { name: "Grilled Tuna Panga", pricePerGram: 1.85, minGrams: 500 },
        { divider: true, title: "Soup" },
        { name: "Sinigang na Baboy", price: 450 },
        { name: "Tinolang Malasugue", price: 580 },
        { name: "Sinigang ng Hipon", price: 520 },
        { name: "Tinolang Native Chicken", price: 470 },
        { divider: true, title: "Vegetables" },
        { name: "Ampalaya w/ Egg", price: 170 },
        { name: "Adobong Kangkong", price: 150 },
        { name: "Chopsuey (Chicken or Pork)", price: 300 },
        { name: "Chopsuey (Seafood)", price: 340 },
        { name: "Eggplant: Crispy Fried/Torta", price: 150 },
        { name: "Pinakbet (Chicken or Pork)", price: 290 },
        { name: "Pinakbet (Seafood)", price: 330 },
        { divider: true, title: "Salad" },
        { name: "Ampalaya Salad", price: 300 },
        { name: "Okra Salad", price: 200 },
        { name: "Eggplant Salad", price: 200 }
      ]
    },
    snacks: {
      title: "Snacks",
      icon: Pizza,
      items: [
        { name: "Egg Sandwich", price: 125 },
        { name: "Fried Banana or Camote Plain", price: 100 },
        { name: "Fried Banana or Camote w/ Sugar", price: 120 },
        { name: "French Fries", price: 150 },
        { name: "Sandwich (Ham & Cheese/Tuna)", price: 135 },
        { name: "Toasted Bread", price: 50 }
      ]
    },
    beverages: {
      title: "Beverages",
      icon: CoffeeIcon,
      items: [
        { divider: true, title: "Refreshments" },
        { name: "Bottled Water", price: 30 },
        { name: "Fresh Buko (Seasonal)", price: 85 },
        { name: "Fresh Calamansi (Seasonal)", price: 70 },
        { name: "Pineapple/Orange Juice", price: 90 },
        { name: "Mango Juice", price: 100 },
        { divider: true, title: "Desserts" },
        { name: "Fruit Shake: Seasonal (Avocado/Durian/Mango/Watermelon)", price: 120 },
        { name: "Halo-Halo Special", price: 175 },
        { name: "Halo-Halo Regular", price: 120 },
        { name: "Mais Con Yelo", price: 120 },
        { divider: true, title: "Cold Drinks" },
        { name: "Coke/Sprite/Royal (8oz)", price: 50 },
        { name: "Coke/Sprite/Royal (Can)", price: 85 },
        { name: "Coke/Sprite/Royal (1.5L)", price: 160 },
        { name: "Ice Tea (1 Pitcher)", price: 150 },
        { name: "Gatorade", price: 80 },
        { divider: true, title: "Hot Drinks" },
        { name: "Brewed Coffee", price: 65 },
        { name: "Brewed Coffee w/ Cream", price: 90 },
        { name: "Coffee w/ Cream", price: 30 },
        { name: "Coffee stick or Coffee Cream", price: 20 },
        { name: "Hot Tea/ Hot Choco (Milo)", price: 30 },
        { divider: true, title: "Beer" },
        { name: "Flavored Beer (Lemon & Apple)", price: 90 },
        { name: "San Mig Light (SML)", price: 95 },
        { name: "SMB Pale Pilsen", price: 90 },
        { name: "Soju", price: 210 },
        { name: "Smirnoff Mule", price: 100 },
        { divider: true, title: "Hard Drinks" },
        { name: "Club Mix (375 ml)", price: 150 },
        { name: "Emperador Light (1L)", price: 350 },
        { name: "Emperador (750 ml)", price: 250 },
        { name: "Gilbey's Gin (1L)", price: 600 },
        { name: "Island Lime (200 ml)", price: 90 },
        { name: "Island Lime (375 ml)", price: 150 },
        { name: "Tanduay Dark (1L)", price: 350 },
        { name: "Tanduay Dark (750ml)", price: 250 },
        { name: "Tanduay Dark (375 ml)", price: 150 },
        { name: "Tanduay Dark (200 ml)", price: 120 }
      ]
    }
  }

  const categories = [
    { id: 'breakfast', label: '🍳 Breakfast' },
    { id: 'lunchDinner', label: '🍽️ Lunch & Dinner' },
    { id: 'snacks', label: '🍿 Snacks' },
    { id: 'beverages', label: '🥤 Beverages' }
  ]

  const currentMenu = menuCategories[activeMenuCategory]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 pt-24">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Activities & Recreation
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-lg">Experience fun and excitement at Costa Marina Beach Resort</p>
        </div>

        {/* Activities Grid - Now with 4 items including Day Tour */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {activities.map((activity, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
              <div className={`h-32 bg-gradient-to-br ${activity.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <activity.icon size={50} className="text-white/50 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{activity.description}</p>
                <ul className="space-y-1">
                  {activity.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-gray-600 flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Day Tour Detailed Info */}
        <div className="mb-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sun size={32} />
              <h2 className="text-2xl md:text-3xl font-bold">Day Tour Experience</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} />
                  <span className="font-semibold">Tour Hours:</span>
                </div>
                <p className="mb-4">6:30 AM - 4:00 PM</p>
                
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} />
                  <span className="font-semibold">Rates:</span>
                </div>
                <p>₱350 per adult</p>
                <p>₱250 per child (ages 4-10)</p>
              </div>
              <div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Day tour inclusions: Use of tables and chairs, access to beach and swimming areas, 
                  and all resort amenities. Perfect for a quick getaway with family and friends!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section - Updated with 4 categories */}
        <div className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🍽️ Restaurant Menu</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
            <p className="text-sm text-amber-600 mt-3">Prices are subject to change without prior notice.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveMenuCategory(cat.id)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  activeMenuCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <currentMenu.icon size={28} className="text-amber-500" />
              {currentMenu.title}
            </h3>
            
            <div className="space-y-4">
              {currentMenu.items.map((item, idx) => {
                if (item.divider) {
                  return (
                    <div key={idx} className="pt-3 mt-3 border-t border-gray-200">
                      <h4 className="font-bold text-lg text-amber-700">{item.title}</h4>
                    </div>
                  )
                }
                return (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-amber-50 px-3 rounded-lg transition-all">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-amber-600">
                      {item.pricePerGram 
                        ? `₱${item.pricePerGram}/g (min ${item.minGrams}g)`
                        : `₱${item.price.toLocaleString()}`
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Menu Notes */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>* All prices are in Philippine Peso (PHP)</p>
            <p>* Prices may change without prior notice</p>
            <p>* Please inform staff of any food allergies or dietary restrictions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivitiesPage