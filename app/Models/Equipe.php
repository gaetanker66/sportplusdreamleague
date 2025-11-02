<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipe extends Model
{
    protected $fillable = [
        'nom',
        'logo',
        'description',
        'rival_id',
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

    public function rival()
    {
        return $this->belongsTo(Equipe::class, 'rival_id');
    }

    public function rivalDe()
    {
        return $this->hasOne(Equipe::class, 'rival_id');
    }
}


