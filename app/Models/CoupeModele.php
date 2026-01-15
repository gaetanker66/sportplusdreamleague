<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

    /**
     * Accessor pour convertir le logo en URL lors de la lecture
     * Gère à la fois les anciens logos en base64 et les nouveaux logos en fichiers
     */
    protected function logo(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }
                
                // Si c'est du base64 (ancien format), retourner tel quel
                if (str_starts_with($value, 'data:image')) {
                    return $value;
                }
                
                // Si c'est un chemin de fichier (nouveau format), retourner l'URL
                if (Storage::disk('public')->exists($value)) {
                    return asset(Storage::url($value));
                }
                
                return null;
            },
            set: function ($value) {
                // Lors de l'écriture, on stocke directement la valeur (chemin de fichier ou base64)
                return $value;
            }
        );
    }
}