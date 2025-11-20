<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoupeMatch extends Model
{
    protected $table = 'coupe_matchs';
    protected $fillable = [
        'round_id',
        'equipe_home_id',
        'equipe_away_id',
        'score_home',
        'score_away',
        'termine',
        'gardien_home_id',
        'gardien_away_id',
        'arrets_home',
        'arrets_away',
        'is_fake',
        'is_aller',
        'numero_match',
        'match_retour_id',
        'score_cumule_home',
        'score_cumule_away',
        'tirs_au_but_home',
        'tirs_au_but_away',
        'homme_du_match_id',
    ];
    protected $casts = ['termine' => 'boolean', 'is_fake' => 'boolean', 'is_aller' => 'boolean'];

    public function round()
    {
        return $this->belongsTo(CoupeRound::class, 'round_id');
    }

    public function homeEquipe()
    {
        return $this->belongsTo(Equipe::class, 'equipe_home_id');
    }

    public function awayEquipe()
    {
        return $this->belongsTo(Equipe::class, 'equipe_away_id');
    }

    public function buts()
    {
        return $this->hasMany(CoupeBut::class, 'coupe_match_id');
    }

    public function cartons()
    {
        return $this->hasMany(CoupeCarton::class, 'coupe_match_id');
    }

    public function matchRetour()
    {
        return $this->belongsTo(CoupeMatch::class, 'match_retour_id');
    }

    public function matchAller()
    {
        return $this->hasOne(CoupeMatch::class, 'match_retour_id');
    }

    public function hommeDuMatch()
    {
        return $this->belongsTo(Joueur::class, 'homme_du_match_id');
    }
}


