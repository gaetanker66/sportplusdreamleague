<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoupeCarton extends Model
{
    protected $table = 'coupe_cartons';
    protected $fillable = ['coupe_match_id','joueur_id','type','minute'];

    public function match()
    {
        return $this->belongsTo(CoupeMatch::class, 'coupe_match_id');
    }
}


