<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoupeBut extends Model
{
    protected $table = 'coupe_buts';
    protected $fillable = ['coupe_match_id','equipe_id','buteur_id','passeur_id','minute','type'];

    public function match()
    {
        return $this->belongsTo(CoupeMatch::class, 'coupe_match_id');
    }
}


