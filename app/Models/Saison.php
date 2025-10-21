<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Saison extends Model
{
    protected $fillable = [
        'nom',
        'date_debut',
        'date_fin',
        'status',
        'ligue_id',
        'nombre_equipes'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    public function ligue()
    {
        return $this->belongsTo(Ligue::class);
    }

    public function equipes()
    {
        return $this->belongsToMany(Equipe::class, 'saison_equipe')->withTimestamps();
    }

    public function journees()
    {
        return $this->hasMany(Journee::class);
    }
}
