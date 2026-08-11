<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;

/**
 * No admin-facing specializations endpoint existed anywhere in the
 * codebase — needed for the Doctors admin page's create/edit form
 * (specialization_id is a required field on Doctor). Read-only for now;
 * add store/update/destroy here if you want specializations to be
 * manageable from the admin UI rather than seeded/managed elsewhere.
 */
class SpecializationController extends Controller
{
    public function index()
    {
        return response()->json(Specialization::orderBy('name')->get());
    }
}
