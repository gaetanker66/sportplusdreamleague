<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoireEtape extends Model
{
    protected $fillable = [
        'titre',
        'date_label',
        'date',
        'description',
        'image',
        'ordre',
        'actif',
    ];

    protected $casts = [
        'date' => 'date',
        'actif' => 'boolean',
        'ordre' => 'integer',
    ];
}
