<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupe extends Model
{
    protected $fillable = ['nom','nombre_equipes','coupe_modele_id','avec_poules','nombre_poules','qualifies_par_poule','matchs_aleatoires','nombre_matchs','victoire_uniquement'];

    protected $casts = [
        'matchs_aleatoires' => 'boolean',
        'victoire_uniquement' => 'boolean'
    ];

    public function equipes()
    {
        return $this->belongsToMany(Equipe::class, 'coupe_equipe')->withTimestamps();
    }

    public function rounds()
    {
        return $this->hasMany(CoupeRound::class, 'coupe_id');
    }

    public function modele()
    {
        return $this->belongsTo(CoupeModele::class, 'coupe_modele_id');
    }
}


