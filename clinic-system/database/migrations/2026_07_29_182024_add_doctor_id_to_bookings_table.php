<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Check if doctor_id column doesn't exist before adding
            if (!Schema::hasColumn('bookings', 'doctor_id')) {
                $table->foreignId('doctor_id')->nullable()->after('patient_id')->constrained('doctors')->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'doctor_id')) {
                $table->dropConstrainedForeignId('doctor_id');
            }
        });
    }
};