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
        Schema::create('addons', function (Blueprint $table) {
            $table->id();
            $table->string('addon_code', 20)->unique();
            $table->string('addon_name', 100);
            $table->enum('addon_type', ['food_beverage', 'water_sports', 'equipment', 'transport', 'event', 'other']);
            $table->decimal('price', 10, 2);
            $table->enum('price_type', ['fixed', 'per_hour', 'per_day', 'per_person', 'per_group'])->default('fixed');
            $table->integer('stock_quantity')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addons');
    }
};
