<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoupeAvecPoule extends Model
{
    protected $fillable = [
        'nom',
        'nombre_equipes',
        'nombre_poules',
        'qualifies_par_poule',
        'coupe_avec_poule_modele_id',
        'phase_finale_generee',
        'coupe_phase_finale_id',
        'matchs_aleatoires'
    ];

    protected $casts = [
        'phase_finale_generee' => 'boolean',
        'matchs_aleatoires' => 'boolean'
    ];

    public function poules()
    {
        return $this->hasMany(Poule::class);
    }

    public function coupePhaseFinale()
    {
        return $this->belongsTo(Coupe::class, 'coupe_phase_finale_id');
    }

    public function modele()
    {
        return $this->belongsTo(CoupeAvecPouleModele::class, 'coupe_avec_poule_modele_id');
    }
}
