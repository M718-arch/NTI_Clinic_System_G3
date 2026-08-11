<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * FIX: the original `bookings` migration constrained `patient_id` to the
 * `users` table:
 *
 *     $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
 *
 * But every controller that writes or reads `bookings.patient_id` treats
 * it as a Patient id, not a User id — e.g. AppointmentController::store()
 * does `'patient_id' => $patient->id` (a Patient model), and every query
 * does `Booking::where('patient_id', $patient->id)`. So application code
 * has always been storing Patient ids in this column; the database
 * constraint just happened to be pointed at the wrong table.
 *
 * This "worked" only because the FK constraint merely checks that *some*
 * row with that id exists in the referenced table — it doesn't check
 * that it's the *right* row. That means:
 *   - Inserts could fail if a patient's id has no matching row in `users`
 *     (e.g. once enough users of other roles are created and id ranges
 *     diverge).
 *   - `onDelete('cascade')` cascades off `users.id`, so deleting some
 *     unrelated user could silently delete a totally different patient's
 *     booking if the ids happened to collide.
 *
 * This migration repoints the constraint at `patients` where it belongs.
 * No data changes are made — since application code already stores
 * `patients.id` values in this column, existing rows should already be
 * correct once the constraint is fixed to match reality.
 *
 * IMPORTANT: back up your database before running this in production,
 * and if you have any bookings whose `patient_id` does NOT correspond to
 * a real `patients.id` (check with a query before migrating), this
 * migration will fail until those rows are cleaned up.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('patient_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};
