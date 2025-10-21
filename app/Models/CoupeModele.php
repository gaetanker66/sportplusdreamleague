<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoupeModele extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'logo',
        'description',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    /**
     * Relation avec les coupes
     */
    public function coupes()
    {
        return $this->hasMany(Coupe::class);
    }
}