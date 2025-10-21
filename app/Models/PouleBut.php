<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PouleBut extends Model
{
    protected $fillable = [
        'poule_match_id',
        'equipe_id',
        'buteur_id',
        'passeur_id',
        'minute',
        'type'
    ];

    public function pouleMatch()
    {
        return $this->belongsTo(PouleMatch::class);
    }

    public function equipe()
    {
        return $this->belongsTo(Equipe::class);
    }

    public function buteur()
    {
        return $this->belongsTo(Joueur::class, 'buteur_id');
    }

    public function passeur()
    {
        return $this->belongsTo(Joueur::class, 'passeur_id');
    }
}
