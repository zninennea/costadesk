<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        $admin = \App\Models\User::create([
            'username' => 'admin',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@costadesk.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $manager = \App\Models\User::create([
            'username' => 'manager',
            'first_name' => 'Manager',
            'last_name' => 'User',
            'email' => 'manager@costadesk.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);

        $staff = \App\Models\User::create([
            'username' => 'staff',
            'first_name' => 'Staff',
            'last_name' => 'User',
            'email' => 'staff@costadesk.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);

        $guest = \App\Models\User::create([
            'username' => 'guest',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'guest@costadesk.com',
            'password' => bcrypt('password'),
            'role' => 'guest',
        ]);

        // Room Categories and Rooms are now seeded in CustomRoomSeeder
        $this->call([
            CustomRoomSeeder::class,
        ]);
    }
}
