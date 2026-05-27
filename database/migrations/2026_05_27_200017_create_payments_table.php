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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_reference', 30)->unique();
            $table->foreignId('bill_id')->constrained()->onDelete('restrict');
            $table->foreignId('guest_id')->constrained()->onDelete('restrict');
            $table->foreignId('processed_by_user_id')->constrained('users')->onDelete('restrict');
            $table->decimal('amount_paid', 10, 2);
            $table->enum('payment_method', ['cash', 'credit_card', 'debit_card', 'gcash', 'paymaya', 'bank_transfer']);
            $table->string('reference_number', 50)->nullable();
            $table->string('card_last_four', 4)->nullable();
            $table->string('approval_code', 50)->nullable();
            $table->dateTime('payment_datetime')->useCurrent();
            $table->enum('status', ['completed', 'pending', 'failed', 'refunded'])->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
