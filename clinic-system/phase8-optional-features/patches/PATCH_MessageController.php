<?php

/**
 * PATCH — add to the existing app/Http/Controllers/Api/MessageController.php
 *
 * "New Message" is one of the five notification types in the Phase 8
 * roadmap. The existing Notification model/table (built in Phase 5 for
 * appointment reschedules) is patient_id-scoped only — it has no
 * equivalent for notifying a doctor of a new message. So this patch
 * fires a notification only when the message's receiver is a patient;
 * doctor-facing message notifications would need a schema change
 * (either a polymorphic notifiable, or a parallel doctor_notifications
 * table) that's out of scope for a message-controller patch.
 *
 * Add the `use App\Models\Notification;` and `use App\Models\Patient;`
 * imports at the top of MessageController.php if not already present
 * (Patient is likely already imported there).
 */

use App\Models\Notification;
use App\Models\Patient;

// ... inside MessageController::send(), right after the existing
// `$message = Message::create([...]);` call and before `$message->load(...)`:

$receiverPatient = Patient::where('user_id', $request->receiver_id)->first();

if ($receiverPatient) {
    Notification::create([
        'patient_id' => $receiverPatient->id,
        'type' => 'new_message',
        'message' => "You have a new message from {$user->name}.",
    ]);
}

// (the rest of send() — $message->load(...), building $messageData,
// returning the response — stays exactly as it already is)
