<?php

namespace App\Http\Controllers;

use App\Models\Transfert;
use App\Models\Joueur;
use App\Models\Equipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransfertController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transferts = Transfert::with(['joueur', 'ancienneEquipe:id,nom', 'nouvelleEquipe:id,nom'])
            ->orderBy('date_transfert', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('transferts/index', compact('transferts'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $joueurs = Joueur::with('equipe:id,nom')->orderBy('nom')->get();
        $equipes = Equipe::select('id', 'nom')->orderBy('nom')->get();
        
        return Inertia::render('transferts/create', compact('joueurs', 'equipes'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'joueur_id' => 'required|exists:joueurs,id',
            'nouvelle_equipe_id' => 'required|exists:equipes,id',
            'date_transfert' => 'required|date',
        ]);

        // Récupérer le joueur et son équipe actuelle
        $joueur = Joueur::findOrFail($validated['joueur_id']);
        $ancienneEquipeId = $joueur->equipe_id;

        // Vérifier que la nouvelle équipe est différente de l'ancienne (si l'ancienne existe)
        if ($ancienneEquipeId && $ancienneEquipeId == $validated['nouvelle_equipe_id']) {
            return redirect()->back()->withErrors(['nouvelle_equipe_id' => 'Le joueur est déjà dans cette équipe.']);
        }

        // Créer le transfert
        $transfert = Transfert::create([
            'joueur_id' => $validated['joueur_id'],
            'ancienne_equipe_id' => $ancienneEquipeId,
            'nouvelle_equipe_id' => $validated['nouvelle_equipe_id'],
            'date_transfert' => $validated['date_transfert'],
        ]);

        // Mettre à jour l'équipe actuelle du joueur
        $joueur->update(['equipe_id' => $validated['nouvelle_equipe_id']]);

        return redirect()->route('dashboard.transferts.index')->with('success', 'Transfert créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Transfert $transfert)
    {
        $transfert->load(['joueur', 'ancienneEquipe', 'nouvelleEquipe']);
        return Inertia::render('transferts/show', compact('transfert'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transfert $transfert)
    {
        $transfert->load(['joueur', 'ancienneEquipe', 'nouvelleEquipe']);
        $joueurs = Joueur::with('equipe:id,nom')->orderBy('nom')->get();
        $equipes = Equipe::select('id', 'nom')->orderBy('nom')->get();
        
        return Inertia::render('transferts/edit', compact('transfert', 'joueurs', 'equipes'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transfert $transfert)
    {
        $validated = $request->validate([
            'joueur_id' => 'required|exists:joueurs,id',
            'nouvelle_equipe_id' => 'required|exists:equipes,id',
            'date_transfert' => 'required|date',
        ]);

        // Récupérer le joueur
        $joueur = Joueur::findOrFail($validated['joueur_id']);

        // Si le joueur a changé, on doit gérer les transferts
        if ($transfert->joueur_id != $validated['joueur_id']) {
            // Pour simplifier, on ne permet pas de changer le joueur d'un transfert existant
            return redirect()->back()->withErrors(['joueur_id' => 'Il n\'est pas possible de changer le joueur d\'un transfert existant.']);
        }

        // Si la nouvelle équipe a changé
        if ($transfert->nouvelle_equipe_id != $validated['nouvelle_equipe_id']) {
            // On doit mettre à jour l'équipe du joueur seulement si ce transfert est le plus récent
            $dernierTransfert = $joueur->transferts()->orderBy('date_transfert', 'desc')->orderBy('created_at', 'desc')->first();
            
            if ($dernierTransfert && $dernierTransfert->id === $transfert->id) {
                // C'est le transfert le plus récent, on peut mettre à jour l'équipe du joueur
                $joueur->update(['equipe_id' => $validated['nouvelle_equipe_id']]);
            }
        }

        // Mettre à jour le transfert
        $transfert->update([
            'nouvelle_equipe_id' => $validated['nouvelle_equipe_id'],
            'date_transfert' => $validated['date_transfert'],
        ]);

        return redirect()->route('dashboard.transferts.index')->with('success', 'Transfert mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfert $transfert)
    {
        $joueur = $transfert->joueur;
        
        // Vérifier si c'est le transfert le plus récent
        $dernierTransfert = $joueur->transferts()->orderBy('date_transfert', 'desc')->orderBy('created_at', 'desc')->first();
        
        if ($dernierTransfert && $dernierTransfert->id === $transfert->id) {
            // C'est le transfert le plus récent, on doit restaurer l'équipe précédente
            $joueur->update(['equipe_id' => $transfert->ancienne_equipe_id]);
        }
        
        $transfert->delete();
        
        return redirect()->route('dashboard.transferts.index')->with('success', 'Transfert supprimé avec succès.');
    }
}