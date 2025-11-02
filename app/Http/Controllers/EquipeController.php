<?php

namespace App\Http\Controllers;

use App\Models\Equipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipeController extends Controller
{
    public function index()
    {
        $equipes = Equipe::orderBy('created_at', 'desc')->get();
        return Inertia::render('equipes/index', compact('equipes'));
    }

    public function create()
    {
        return Inertia::render('equipes/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
        ]);

        Equipe::create($validated);

        return redirect()->route('equipes.index')->with('success', 'Équipe créée avec succès.');
    }

    public function show(Equipe $equipe)
    {
        $equipe->load('joueurs');
        return Inertia::render('equipes/show', compact('equipe'));
    }

    public function edit(Equipe $equipe)
    {
        $equipe->load(['joueurs.poste', 'joueurs.postesSecondaires']);
        $postes = \App\Models\Poste::orderBy('nom')->get();
        return Inertia::render('equipes/edit', compact('equipe', 'postes'));
    }

    public function update(Request $request, Equipe $equipe)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'players' => 'array',
            'players.*.id' => 'required|exists:joueurs,id',
            'players.*.nom' => 'required|string|max:255',
            'players.*.poste_id' => 'nullable|exists:postes,id',
            'players.*.photo' => 'nullable|string',
            'players.*.postes_secondaires' => 'array',
            'players.*.postes_secondaires.*' => 'exists:postes,id',
        ]);

        $equipe->update($request->only('nom', 'logo'));

        if ($request->filled('players')) {
            foreach ($request->input('players') as $pl) {
                $joueur = $equipe->joueurs()->find($pl['id']);
                if (!$joueur) {
                    continue;
                }
                $joueur->update([
                    'nom' => $pl['nom'],
                    'poste_id' => $pl['poste_id'] ?? null,
                    'photo' => $pl['photo'] ?? null,
                ]);
                // Toujours synchroniser pour gérer l'effacement aussi
                $joueur->postesSecondaires()->sync($pl['postes_secondaires'] ?? []);
            }
        }

        return redirect()->route('equipes.index')->with('success', 'Équipe mise à jour avec succès.');
    }

    public function destroy(Equipe $equipe)
    {
        $equipe->delete();
        return redirect()->route('equipes.index')->with('success', 'Équipe supprimée avec succès.');
    }

    // Joueurs inline
    public function addPlayer(Request $request, Equipe $equipe)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'poste_id' => 'nullable|exists:postes,id',
            'photo' => 'nullable|string',
            'postes_secondaires' => 'array',
            'postes_secondaires.*' => 'exists:postes,id',
        ]);

        $joueur = $equipe->joueurs()->create([
            'nom' => $validated['nom'],
            'poste_id' => $validated['poste_id'] ?? null,
            'photo' => $validated['photo'] ?? null,
        ]);

        if (!empty($validated['postes_secondaires'])) {
            $joueur->postesSecondaires()->sync($validated['postes_secondaires']);
        }
        return back()->with('success', 'Joueur ajouté.');
    }

    public function updatePlayer(Request $request, Equipe $equipe, $joueurId)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'poste_id' => 'nullable|exists:postes,id',
            'photo' => 'nullable|string',
            'postes_secondaires' => 'array',
            'postes_secondaires.*' => 'exists:postes,id',
        ]);

        $joueur = $equipe->joueurs()->findOrFail($joueurId);
        $joueur->update([
            'nom' => $validated['nom'],
            'poste_id' => $validated['poste_id'] ?? null,
            'photo' => $validated['photo'] ?? null,
        ]);

        // Synchroniser systématiquement, y compris pour effacer quand vide
        $joueur->postesSecondaires()->sync($request->input('postes_secondaires', []));
        return back()->with('success', 'Joueur mis à jour.');
    }

    public function deletePlayer(Equipe $equipe, $joueurId)
    {
        $joueur = $equipe->joueurs()->findOrFail($joueurId);
        $joueur->delete();
        return back()->with('success', 'Joueur supprimé.');
    }

    /**
     * API : Récupérer les logos des équipes par leurs IDs
     */
    public function getLogos(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:equipes,id',
        ]);

        $equipes = Equipe::whereIn('id', $validated['ids'])
            ->select('id', 'logo')
            ->get()
            ->mapWithKeys(function ($equipe) {
                return [$equipe->id => $equipe->logo];
            });

        return response()->json($equipes);
    }
}


