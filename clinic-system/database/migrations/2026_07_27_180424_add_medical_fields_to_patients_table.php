<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Patient-filled fields
            $table->text('allergies')->nullable()->after('emergency_contact_phone');
            $table->text('chronic_diseases')->nullable()->after('allergies');
            $table->text('current_medications')->nullable()->after('chronic_diseases');
            $table->text('lifestyle_habits')->nullable()->after('current_medications');
            
            // Doctor-filled fields
            $table->text('diagnoses')->nullable()->after('medical_history');
            $table->text('family_history')->nullable()->after('diagnoses');
            $table->text('past_surgeries')->nullable()->after('family_history');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'allergies',
                'chronic_diseases',
                'current_medications',
                'lifestyle_habits',
                'diagnoses',
                'family_history',
                'past_surgeries'
            ]);
        });
    }
};