<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'photo')) {
                $table->string('photo')->nullable()->after('status');
            }
        });
    }

    public function down()
    {
        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'photo')) {
                $table->dropColumn('photo');
            }
        });
    }
};