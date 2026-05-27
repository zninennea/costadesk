<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->foreignId('room_category_id')->constrained()->onDelete('restrict');
            $table->string('name')->nullable(); // room_name in ERD
            $table->integer('floor_number')->default(1);
            $table->decimal('price', 10, 2)->nullable(); // To override category price
            $table->integer('capacity')->nullable();
            $table->integer('min_heads')->nullable();
            $table->decimal('extra_person_charge', 10, 2)->default(0);
            $table->enum('status', ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'])->default('available');
            $table->text('description')->nullable();
            $table->json('amenities')->nullable(); // stored as JSON array
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
