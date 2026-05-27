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
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('discount_code', 30)->unique();
            $table->string('discount_name', 100);
            $table->enum('discount_type', ['percentage', 'fixed', 'sc_pwd']);
            $table->decimal('discount_value', 10, 2);
            $table->enum('discount_scope', ['room', 'addons', 'entire_bill'])->default('entire_bill');
            $table->date('valid_from');
            $table->date('valid_to');
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('min_stay_nights')->default(0);
            $table->decimal('min_spend_amount', 10, 2)->default(0);
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
