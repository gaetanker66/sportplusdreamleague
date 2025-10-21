<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carton extends Model
{
    protected $fillable = ['match_id','joueur_id','type','minute'];

    public function match()
    {
        return $this->belongsTo(MatchModel::class, 'match_id');
    }
}


