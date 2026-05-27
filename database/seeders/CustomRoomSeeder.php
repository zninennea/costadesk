<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomCategory;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class CustomRoomSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        DB::table('bookings')->delete();
        DB::table('rooms')->delete();
        DB::table('room_categories')->delete();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
        
        // Seed categories
        $categories = [
            'Single' => RoomCategory::create(['name' => 'Single', 'description' => 'Single room', 'base_price' => 4800, 'capacity' => 4]),
            'Hotel' => RoomCategory::create(['name' => 'Hotel', 'description' => 'Hotel type', 'base_price' => 4800, 'capacity' => 5]),
            'Dormitory' => RoomCategory::create(['name' => 'Dormitory', 'description' => 'Dormitory type', 'base_price' => 13000, 'capacity' => 10]),
            'Duplex' => RoomCategory::create(['name' => 'Duplex', 'description' => 'Duplex type', 'base_price' => 4800, 'capacity' => 2]),
            'Villa' => RoomCategory::create(['name' => 'Villa', 'description' => 'Villa type', 'base_price' => 20000, 'capacity' => 10]),
        ];

        // Seed Rooms
        $rooms = [
            // Single
            ['name' => 'Casa Maria', 'category' => 'Single', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Lucia', 'category' => 'Single', 'price' => 4800, 'capacity' => 2, 'min_heads' => 2],
            ['name' => 'Casa Paeng', 'category' => 'Single', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Pia', 'category' => 'Single', 'price' => 5500, 'capacity' => 5, 'min_heads' => 2],
            ['name' => 'Casa Pian', 'category' => 'Single', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Pimi', 'category' => 'Single', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Pilar', 'category' => 'Single', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            
            // Hotel
            ['name' => 'Casa Nemesio (Room N101)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 5, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N106)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 5, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N102)', 'category' => 'Hotel', 'price' => 4500, 'capacity' => 3, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N105)', 'category' => 'Hotel', 'price' => 4500, 'capacity' => 3, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N103)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N104)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N201)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 5, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N206)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 5, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N202)', 'category' => 'Hotel', 'price' => 4500, 'capacity' => 2, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N205)', 'category' => 'Hotel', 'price' => 4500, 'capacity' => 3, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N203)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            ['name' => 'Casa Nemesio (Room N204)', 'category' => 'Hotel', 'price' => 4800, 'capacity' => 4, 'min_heads' => 2],
            
            // Dormitory
            ['name' => 'Casa Theresa', 'category' => 'Dormitory', 'price' => 13000, 'capacity' => 10, 'min_heads' => 5],
            
            // Duplex
            ['name' => 'Casa Mayee (Room Casa Mayee 1)', 'category' => 'Duplex', 'price' => 4800, 'capacity' => 2, 'min_heads' => 2],
            ['name' => 'Casa Mayee (Room Casa Mayee 1&2)', 'category' => 'Duplex', 'price' => 9000, 'capacity' => 6, 'min_heads' => 4],
            ['name' => 'Casa Mayee (Room Casa Mayee 2)', 'category' => 'Duplex', 'price' => 4800, 'capacity' => 2, 'min_heads' => 2],
            
            // Villa
            ['name' => 'Villa Rosario', 'category' => 'Villa', 'price' => 20000, 'capacity' => 10, 'min_heads' => 5],
        ];

        $i = 1;
        foreach ($rooms as $r) {
            Room::create([
                'room_number' => str_pad($i++, 3, '0', STR_PAD_LEFT),
                'name' => $r['name'],
                'room_category_id' => $categories[$r['category']]->id,
                'price' => $r['price'],
                'capacity' => $r['capacity'],
                'min_heads' => $r['min_heads'],
                'status' => 'available'
            ]);
        }
    }
}
