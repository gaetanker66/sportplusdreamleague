<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipe extends Model
{
    protected $fillable = [
        'nom',
        'logo',
        'description',
        'maillot_domicile',
        'maillot_exterieur',
        'maillot_3eme',
    ];

    public function joueurs()
    {
        return $this->hasMany(Joueur::class);
    }

    public function saisons()
    {
        return $this->belongsToMany(Saison::class, 'saison_equipe')->withTimestamps();
    }

    public function poules()
    {
        return $this->belongsToMany(Poule::class, 'poule_equipe')->withPivot([
            'points', 'matchs_joues', 'victoires', 'nuls', 'defaites',
            'buts_pour', 'buts_contre', 'difference_buts'
        ])->withTimestamps();
    }

    public function rivales()
    {
        return $this->belongsToMany(Equipe::class, 'equipe_rivale', 'equipe_id', 'rivale_id')
            ->withTimestamps();
    }

    public function actualites()
    {
        return $this->belongsToMany(Actualite::class, 'actualite_equipe')->withTimestamps();
    }
}


