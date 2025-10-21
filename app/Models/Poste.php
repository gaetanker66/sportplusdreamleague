<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Poste extends Model
{
    protected $fillable = [
        'nom',
    ];

    public function joueursPrincipaux()
    {
        return $this->hasMany(Joueur::class);
    }

    public function joueursSecondaires()
    {
        return $this->belongsToMany(Joueur::class, 'joueur_poste')->withTimestamps();
    }
}


