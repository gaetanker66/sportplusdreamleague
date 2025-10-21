<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Poule extends Model
{
    protected $fillable = [
        'coupe_avec_poule_id',
        'nom',
        'numero'
    ];

    public function coupeAvecPoule()
    {
        return $this->belongsTo(CoupeAvecPoule::class);
    }

    public function equipes()
    {
        return $this->belongsToMany(Equipe::class, 'poule_equipe')->withPivot([
            'points', 'matchs_joues', 'victoires', 'nuls', 'defaites',
            'buts_pour', 'buts_contre', 'difference_buts'
        ])->withTimestamps();
    }

    public function matchs()
    {
        return $this->hasMany(PouleMatch::class);
    }

    public function classement()
    {
        return $this->equipes()->orderByDesc('pivot_points')
                              ->orderByDesc('pivot_difference_buts')
                              ->orderByDesc('pivot_buts_pour');
    }
}
