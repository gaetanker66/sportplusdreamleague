<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Journee extends Model
{
    protected $fillable = [
        'saison_id',
        'date',
        'numero',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function saison()
    {
        return $this->belongsTo(Saison::class);
    }

    public function matchs()
    {
        return $this->hasMany(MatchModel::class, 'journee_id');
    }
}


