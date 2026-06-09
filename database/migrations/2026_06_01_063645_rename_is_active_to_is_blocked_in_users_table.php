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
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('is_active', 'is_blocked');
        });
        
        // Invert the logic: active=true means blocked=false
        \Illuminate\Support\Facades\DB::table('users')->update([
            'is_blocked' => \Illuminate\Support\Facades\DB::raw('NOT is_blocked')
        ]);
        
        // Also update default value (for new users, they are not blocked)
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_blocked')->default(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_blocked')->default(true)->change();
        });
        
        \Illuminate\Support\Facades\DB::table('users')->update([
            'is_blocked' => \Illuminate\Support\Facades\DB::raw('NOT is_blocked')
        ]);
        
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('is_blocked', 'is_active');
        });
    }
};
