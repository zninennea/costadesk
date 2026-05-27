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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name', 100);
            $table->enum('report_type', ['daily_sales', 'occupancy', 'revenue', 'guest_history', 'addons_sales', 'discount_usage']);
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('report_date_start');
            $table->date('report_date_end');
            $table->longText('report_data');
            $table->string('file_path')->nullable();
            $table->dateTime('generated_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
