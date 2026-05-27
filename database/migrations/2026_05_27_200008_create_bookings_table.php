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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 20)->unique()->nullable(); // reservation_code
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // user who created it (staff or online guest)
            $table->foreignId('guest_id')->nullable(); // will constrain later to guests table
            $table->foreignId('room_id')->constrained()->onDelete('restrict');
            $table->enum('source_channel', ['website', 'facebook', 'phone', 'walk_in', 'booking_office'])->default('website');
            $table->dateTime('booking_date')->useCurrent();
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('number_of_adults')->default(1);
            $table->integer('number_of_children')->default(0);
            $table->integer('number_of_infants')->default(0);
            $table->text('special_requests')->nullable();
            $table->decimal('total_price', 10, 2)->default(0);
            $table->enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'completed'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])->default('unpaid');
            $table->dateTime('confirmed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->boolean('is_walk_in')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
