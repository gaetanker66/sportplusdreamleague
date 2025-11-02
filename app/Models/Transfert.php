<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfert extends Model
{
    protected $fillable = [
        'joueur_id',
        'ancienne_equipe_id',
        'nouvelle_equipe_id',
        'date_transfert',
    ];

    protected $casts = [
        'date_transfert' => 'date',
    ];

    public function joueur()
    {
        return $this->belongsTo(Joueur::class);
    }

    public function ancienneEquipe()
    {
        return $this->belongsTo(Equipe::class, 'ancienne_equipe_id');
    }

    public function nouvelleEquipe()
    {
        return $this->belongsTo(Equipe::class, 'nouvelle_equipe_id');
    }
}