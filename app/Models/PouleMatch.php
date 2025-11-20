<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PouleMatch extends Model
{
    protected $table = 'poule_matchs';

    protected $fillable = [
        'poule_id',
        'journee',
        'equipe_home_id',
        'equipe_away_id',
        'score_home',
        'score_away',
        'termine',
        'gardien_home_id',
        'gardien_away_id',
        'arrets_home',
        'arrets_away',
        'homme_du_match_id'
    ];

    protected $casts = [
        'termine' => 'boolean'
    ];

    public function poule()
    {
        return $this->belongsTo(Poule::class);
    }

    public function homeEquipe()
    {
        return $this->belongsTo(Equipe::class, 'equipe_home_id');
    }

    public function awayEquipe()
    {
        return $this->belongsTo(Equipe::class, 'equipe_away_id');
    }

    public function gardienHome()
    {
        return $this->belongsTo(Joueur::class, 'gardien_home_id');
    }

    public function gardienAway()
    {
        return $this->belongsTo(Joueur::class, 'gardien_away_id');
    }

    public function buts()
    {
        return $this->hasMany(PouleBut::class);
    }

    public function cartons()
    {
        return $this->hasMany(PouleCarton::class);
    }

    public function hommeDuMatch()
    {
        return $this->belongsTo(Joueur::class, 'homme_du_match_id');
    }
}
