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
        Schema::create('checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('set null'); // reservation_id
            $table->foreignId('guest_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('restrict');
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->dateTime('checkin_datetime')->useCurrent();
            $table->dateTime('expected_checkout_datetime');
            $table->string('govt_id_verified', 50)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_early_checkin')->default(false);
            $table->decimal('early_checkin_fee', 10, 2)->default(0);
            $table->enum('status', ['active', 'checked_out', 'extended'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkins');
    }
};
