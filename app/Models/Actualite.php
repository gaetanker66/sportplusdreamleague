<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Actualite extends Model
{
    protected $fillable = [
        'type',
        'contenu',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function equipes()
    {
        return $this->belongsToMany(Equipe::class, 'actualite_equipe')->withTimestamps();
    }

    public function joueurs()
    {
        return $this->belongsToMany(Joueur::class, 'actualite_joueur')->withTimestamps();
    }
}
