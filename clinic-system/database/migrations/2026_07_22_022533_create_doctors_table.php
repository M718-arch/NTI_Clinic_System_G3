<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();

            $table->foreignId('specialization_id')
                  ->constrained()
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->enum('gender', ['male', 'female']);

            $table->date('date_of_birth')->nullable();

            $table->unsignedTinyInteger('experience_years')->default(0);

            $table->decimal('consultation_fee', 8, 2)->default(0);

            $table->text('address')->nullable();

            $table->text('bio')->nullable();

            $table->string('image')->nullable();

            $table->boolean('status')->default(true);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
