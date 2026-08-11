<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Adds the patient-registration approval workflow from the roadmap:
 * pending -> approved / rejected.
 *
 * Kept separate from the existing `status` boolean on purpose:
 * `status` = "is this account currently active" (already used for e.g.
 * doctors being enabled/disabled), `approval_status` = "has staff
 * reviewed and approved this registration". Conflating the two would
 * make it ambiguous whether a `false`/inactive patient was rejected,
 * deactivated after being approved, or never reviewed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('approval_status')->default('pending')->after('status');
            $table->foreignId('approved_by')->nullable()->after('approval_status')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->string('rejection_reason')->nullable()->after('approved_at');
        });

        // Backfill: every patient that existed before this migration was
        // already able to log in and book — treat them as pre-approved so
        // this migration doesn't retroactively lock anyone out.
        DB::table('patients')->update(['approval_status' => 'approved']);
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn(['approval_status', 'approved_at', 'rejection_reason']);
        });
    }
};
