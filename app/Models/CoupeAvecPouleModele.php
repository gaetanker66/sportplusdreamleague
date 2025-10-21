<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoupeAvecPouleModele extends Model
{
    protected $fillable = [
        'nom',
        'logo',
        'description',
        'nombre_equipes',
        'nombre_poules',
        'qualifies_par_poule',
        'actif'
    ];

    protected $casts = [
        'actif' => 'boolean'
    ];

    public function coupesAvecPoules()
    {
        return $this->hasMany(CoupeAvecPoule::class);
    }
}
