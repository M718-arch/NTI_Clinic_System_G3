<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Queue Management. Builds on `checked_in_at` (Phase 5) rather than
 * replacing it — checked_in_at still means "arrived at the desk";
 * queue_status tracks where they are after that: waiting -> in_consult
 * -> done. `room` and `called_at` are set when a patient is sent in
 * (either the receptionist sends them to a room, or the doctor calls
 * them from their queue view — see the Doctor QueueController).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // waiting | in_consult | done | null (not checked in / n/a)
            $table->string('queue_status')->nullable()->after('checked_in_at');
            $table->string('room')->nullable()->after('queue_status');
            $table->timestamp('called_at')->nullable()->after('room');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['queue_status', 'room', 'called_at']);
        });
    }
};
