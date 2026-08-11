<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained('doctors')->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('test_name');
            $table->string('result')->nullable();
            $table->string('unit')->nullable();
            $table->string('reference_range')->nullable();
            $table->date('result_date');
            // Path under the `public` disk, same convention as
            // doctor/patient photo uploads — not a raw upload endpoint
            // by default, see EmrController note.
            $table->string('file_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'result_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_results');
    }
};
