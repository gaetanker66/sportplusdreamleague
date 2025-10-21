<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PouleCarton extends Model
{
    protected $fillable = [
        'poule_match_id',
        'joueur_id',
        'type',
        'minute'
    ];

    public function pouleMatch()
    {
        return $this->belongsTo(PouleMatch::class);
    }

    public function joueur()
    {
        return $this->belongsTo(Joueur::class);
    }
}
