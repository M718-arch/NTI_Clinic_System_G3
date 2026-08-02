<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->string('clinic_name')->nullable()->after('image');
            $table->string('branch')->nullable()->after('clinic_name');
            $table->string('operating_hours')->nullable()->after('branch');
        });
    }

    public function down()
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn(['clinic_name', 'branch', 'operating_hours']);
        });
    }
};