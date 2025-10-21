<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class But extends Model
{
    protected $fillable = [
        'match_id', 'equipe_id', 'buteur_id', 'passeur_id', 'minute', 'type'
    ];

    public function match()
    {
        return $this->belongsTo(MatchModel::class, 'match_id');
    }
}


