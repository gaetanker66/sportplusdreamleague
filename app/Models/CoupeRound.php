<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoupeRound extends Model
{
    protected $table = 'coupe_rounds';
    protected $fillable = ['coupe_id','numero','label'];

    public function coupe()
    {
        return $this->belongsTo(Coupe::class);
    }

    public function matchs()
    {
        return $this->hasMany(CoupeMatch::class, 'round_id');
    }
}


