<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user1_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user2_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Add unique constraint to prevent duplicate conversations
            $table->unique(['user1_id', 'user2_id']);
            $table->index(['user1_id', 'user2_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('conversations');
    }
};