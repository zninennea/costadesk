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
        Schema::create('checkouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkin_id')->constrained()->onDelete('cascade');
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->dateTime('checkout_datetime')->useCurrent();
            $table->boolean('is_late_checkout')->default(false);
            $table->decimal('late_checkout_fee', 10, 2)->default(0);
            $table->text('damage_notes')->nullable();
            $table->decimal('damage_charge', 10, 2)->default(0);
            $table->text('lost_items_notes')->nullable();
            $table->decimal('lost_items_charge', 10, 2)->default(0);
            $table->enum('status', ['completed', 'disputed'])->default('completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkouts');
    }
};
