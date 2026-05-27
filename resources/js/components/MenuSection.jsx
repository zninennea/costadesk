import { useState } from 'react'
import { Coffee, Utensils, Soup, Apple, Fish, Beef, Bike, Music, Volleyball } from 'lucide-react'

const MenuSection = () => {
  const [activeMenu, setActiveMenu] = useState('breakfast')

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
        { name: "Grilled or Fried Longganisa", price: 290 }
      ]
    },
    noodles: {
      title: "Noodles",
      icon: Utensils,
      items: [
        { name: "Bihon or Canton Guisado (Chicken or Pork)", price: 300 },
        { name: "Bihon or Canton Guisado (Seafoods)", price: 330 }
      ]
    },
    rice: {
      title: "Rice (per cup)",
      icon: Apple,
      items: [
        { name: "Plain Rice", price: 35 },
        { name: "Garlic Rice", price: 50 }
      ]
    },
    pork: {
      title: "Pork Dishes",
      icon: Beef,
      items: [
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
        { name: "Sizzling Sisig", price: 350 }
      ]
    },
    poultry: {
      title: "Poultry",
      icon: Beef,
      items: [
        { name: "Battered Chicken", price: 450 },
        { name: "Chicken Adobo", price: 290 },
        { name: "Chicken Afritada", price: 300 },
        { name: "Chicken BBQ", price: 220 },
        { name: "Fried Chicken", price: 370 }
      ]
    },
    beef: {
      title: "Beef",
      icon: Beef,
      items: [
        { name: "Beef Caldereta", price: 500 },
        { name: "Beef Steak (Tagalog)", price: 510 },
        { name: "Beef Steak: Imported (Rib Eye/ Porter House/ T-Bone)", price: 650 }
      ]
    },
    seafoods: {
      title: "Seafoods",
      icon: Fish,
      items: [
        { name: "Fish Fillet (Malasugue)", price: 460 },
        { name: "Fried Shrimp", price: 550 },
        { name: "Pompano (Fried/Steamed/Paksiw)", price: 700 },
        { name: "Grilled Malasugue", price: 450 },
        { name: "Imperial Tempura", price: 800 },
        { name: "Kinilaw (Malasugue)", price: 470 },
        { name: "Sashimi (Malasugue)", price: 440 },
        { name: "Steamed Hipon", price: 550 },
        { name: "Spicy Shrimp w/ Kangkong", price: 560 }
      ]
    },
    seasonal: {
      title: "Seasonal Seafoods (Price/Gram)",
      icon: Fish,
      items: [
        { name: "Kitang (Grilled)", pricePerGram: 2.25, minGrams: 300 },
        { name: "Palid (Grilled)", pricePerGram: 2.25, minGrams: 300 },
        { name: "Lapu-Lapu (Grilled/Fried/Steamed/Sweet and Sour)", pricePerGram: 2.50, minGrams: 300 },
        { name: "Grilled Bangus (Grilled/Sinigang/Daing/Sisig/Paksiw)", pricePerGram: 1.85, minGrams: 400 },
        { name: "Squid (Calamares/Grilled/Adobo/Sizzling)", pricePerGram: 2.25, minGrams: 400 },
        { name: "Grilled Tuna Belly", pricePerGram: 1.85, minGrams: 500 },
        { name: "Grilled Tuna Panga", pricePerGram: 1.85, minGrams: 500 }
      ]
    },
    soup: {
      title: "Soup",
      icon: Soup,
      items: [
        { name: "Sinigang na Baboy", price: 450 },
        { name: "Tinolang Malasugue", price: 580 },
        { name: "Sinigang ng Hipon", price: 520 },
        { name: "Tinolang Native Chicken", price: 470 }
      ]
    },
    vegetables: {
      title: "Vegetables",
      icon: Apple,
      items: [
        { name: "Ampalaya w/ Egg", price: 170 },
        { name: "Adobong Kangkong", price: 150 },
        { name: "Chopsuey (Chicken or Pork)", price: 300 },
        { name: "Chopsuey (Seafood)", price: 340 },
        { name: "Eggplant: Crispy Fried/Torta", price: 150 },
        { name: "Pinakbet (Chicken or Pork)", price: 290 },
        { name: "Pinakbet (Seafood)", price: 330 }
      ]
    },
    salad: {
      title: "Salad",
      icon: Apple,
      items: [
        { name: "Ampalaya Salad", price: 300 },
        { name: "Okra Salad", price: 200 },
        { name: "Eggplant Salad", price: 200 }
      ]
    }
  }

  const categories = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'noodles', label: 'Noodles' },
    { id: 'rice', label: 'Rice' },
    { id: 'pork', label: 'Pork' },
    { id: 'poultry', label: 'Poultry' },
    { id: 'beef', label: 'Beef' },
    { id: 'seafoods', label: 'Seafoods' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'soup', label: 'Soup' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'salad', label: 'Salad' }
  ]

  const currentMenu = menuCategories[activeMenu]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🍽️ Restaurant Menu</h3>
        <p className="text-sm text-amber-600">Prices are subject to change without prior notice.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveMenu(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeMenu === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <currentMenu.icon size={24} className="text-amber-500" />
          {currentMenu.title}
        </h4>
        <div className="space-y-2">
          {currentMenu.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-amber-50 px-3 rounded-lg transition-all">
              <span className="text-gray-700">{item.name}</span>
              <span className="font-semibold text-amber-600">
                {item.pricePerGram 
                  ? `₱${item.pricePerGram}/g (min ${item.minGrams}g)`
                  : `₱${item.price.toLocaleString()}`
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MenuSection