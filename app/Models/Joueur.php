<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Joueur extends Model
{
    protected $fillable = [
        'equipe_id',
        'nom',
        'poste_id',
        'photo',
    ];

    public function equipe()
    {
        return $this->belongsTo(Equipe::class);
    }

    public function poste()
    {
        return $this->belongsTo(Poste::class);
    }

    public function postesSecondaires()
    {
        return $this->belongsToMany(Poste::class, 'joueur_poste')->withTimestamps();
    }
}


