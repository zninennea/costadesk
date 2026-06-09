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
        Schema::table('bill_discounts', function (Blueprint $table) {
            $table->foreignId('approved_by_user_id')->nullable()->change();
            $table->dateTime('approved_at')->nullable()->change();
            
            // Note: Since we are using sqlite or mysql, changing foreign keys might be tricky.
            // If Doctrine DBAL throws error, we use DB raw but Laravel 11 handles it.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bill_discounts', function (Blueprint $table) {
            $table->foreignId('approved_by_user_id')->nullable(false)->change();
            $table->dateTime('approved_at')->nullable(false)->change();
        });
    }
};
