<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchModel extends Model
{
    protected $table = 'matchs';

    protected $fillable = [
        'journee_id', 'equipe_home_id', 'equipe_away_id',
        'gardien_home_id', 'gardien_away_id',
        'arrets_home', 'arrets_away',
        'score_home', 'score_away', 'termine',
    ];

    protected $casts = [
        'termine' => 'boolean',
    ];

    public function journee()
    {
        return $this->belongsTo(Journee::class);
    }

    public function buts()
    {
        return $this->hasMany(But::class, 'match_id');
    }

    public function cartons()
    {
        return $this->hasMany(Carton::class, 'match_id');
    }

    public function homeEquipe()
    {
        return $this->belongsTo(Equipe::class, 'equipe_home_id');
    }

    public function awayEquipe()
    {
        return $this->belongsTo(Equipe::class, 'equipe_away_id');
    }

    public function recalculeScore(): void
    {
        $home = $this->buts()->where('equipe_id', $this->equipe_home_id)->count();
        $away = $this->buts()->where('equipe_id', $this->equipe_away_id)->count();
        $this->update(['score_home' => $home, 'score_away' => $away]);
    }
}


