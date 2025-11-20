<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Joueur extends Model
{
    protected $fillable = [
        'equipe_id',
        'nom',
        'poste_id',
        'photo',
        'description',
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

    public function transferts()
    {
        return $this->hasMany(Transfert::class)->orderBy('date_transfert', 'desc');
    }

    /**
     * Obtenir l'équipe du joueur à une date donnée en tenant compte des transferts
     */
    public function getEquipeAtDate($date): ?int
    {
        // Convertir la date en Carbon si nécessaire
        if (!$date instanceof Carbon) {
            $date = Carbon::parse($date);
        }

        try {
            // Vérifier si la table transferts existe et trouver le dernier transfert avant ou à cette date
            $dernierTransfert = $this->transferts()
                ->where('date_transfert', '<=', $date->format('Y-m-d'))
                ->orderBy('date_transfert', 'desc')
                ->first();

            // Si un transfert existe, retourner la nouvelle équipe de ce transfert
            if ($dernierTransfert) {
                return $dernierTransfert->nouvelle_equipe_id;
            }
        } catch (\Exception $e) {
            // Si la table transferts n'existe pas ou autre erreur, on continue avec l'équipe actuelle
            // Log l'erreur en mode développement si nécessaire
            if (config('app.debug')) {
                \Log::debug('Erreur lors de la récupération des transferts pour le joueur ' . $this->id . ': ' . $e->getMessage());
            }
        }

        // Retourner l'équipe actuelle (ou initiale si aucun transfert ou en cas d'erreur)
        return $this->equipe_id;
    }

    public function actualites()
    {
        return $this->belongsToMany(Actualite::class, 'actualite_joueur')->withTimestamps();
    }
}
