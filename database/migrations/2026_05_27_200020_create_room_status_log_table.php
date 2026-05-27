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
        Schema::create('room_status_log', function (Blueprint $table) {
            $table->id('log_id');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('previous_status', ['available', 'occupied', 'maintenance', 'reserved', 'cleaning']);
            $table->enum('new_status', ['available', 'occupied', 'maintenance', 'reserved', 'cleaning']);
            $table->text('reason')->nullable();
            $table->dateTime('changed_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_status_log');
    }
};
