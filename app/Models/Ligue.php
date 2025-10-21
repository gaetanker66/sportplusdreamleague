<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ligue extends Model
{
    protected $fillable = [
        'nom',
        'logo',
        'niveau',
        'nombre_equipes'
    ];

    public function saisons()
    {
        return $this->hasMany(Saison::class);
    }
}
