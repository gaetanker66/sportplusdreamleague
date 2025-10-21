<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PouleEquipe extends Model
{
    protected $table = 'poule_equipe';

    protected $fillable = [
        'poule_id',
        'equipe_id',
        'points',
        'matchs_joues',
        'victoires',
        'nuls',
        'defaites',
        'buts_pour',
        'buts_contre',
        'difference_buts'
    ];

    protected $casts = [
        'points' => 'integer',
        'matchs_joues' => 'integer',
        'victoires' => 'integer',
        'nuls' => 'integer',
        'defaites' => 'integer',
        'buts_pour' => 'integer',
        'buts_contre' => 'integer',
        'difference_buts' => 'integer'
    ];

    public function poule()
    {
        return $this->belongsTo(Poule::class);
    }

    public function equipe()
    {
        return $this->belongsTo(Equipe::class);
    }
}
