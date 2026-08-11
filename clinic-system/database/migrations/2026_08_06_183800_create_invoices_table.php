<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 6 — Billing.
 *
 * Kept intentionally simple per the roadmap: one invoice per charge,
 * optionally tied to a booking (the common case — billing for a
 * completed/confirmed appointment) but not required to be (covers
 * walk-in charges, supplies, etc. that don't map to a single booking).
 *
 * `service_name` and `doctor_id` are snapshotted onto the invoice at
 * creation time rather than only derived through the booking→service→
 * doctor chain, so an invoice's record of what was billed and by whom
 * stays stable even if the underlying service is later renamed or
 * reassigned.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique()->nullable();

            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained('doctors')->nullOnDelete();

            $table->string('service_name')->nullable();
            $table->decimal('amount', 10, 2);

            // pending | paid | cancelled
            $table->string('status')->default('pending');

            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();

            // Who created this invoice — a receptionist or admin.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['doctor_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
