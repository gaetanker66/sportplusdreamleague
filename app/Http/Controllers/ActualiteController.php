<?php

namespace App\Http\Controllers;

use App\Models\Actualite;
use App\Models\Equipe;
use App\Models\Joueur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ActualiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $actualites = Actualite::with(['equipes', 'joueurs'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('actualites/index', compact('actualites'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $equipes = Equipe::select('id', 'nom')->orderBy('nom')->get();
        $joueurs = Joueur::with('equipe')->select('id', 'nom', 'equipe_id')->orderBy('nom')->get();
        
        return Inertia::render('actualites/create', compact('equipes', 'joueurs'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:rumeur,transfert',
            'contenu' => 'required|string',
            'date' => 'required|date',
            'equipes' => 'nullable|array',
            'equipes.*' => 'exists:equipes,id',
            'joueurs' => 'nullable|array',
            'joueurs.*' => 'exists:joueurs,id',
        ]);

        $actualite = Actualite::create([
            'type' => $validated['type'],
            'contenu' => $validated['contenu'],
            'date' => $validated['date'],
        ]);

        if (!empty($validated['equipes'])) {
            $actualite->equipes()->sync($validated['equipes']);
        }

        if (!empty($validated['joueurs'])) {
            $actualite->joueurs()->sync($validated['joueurs']);
        }

        return redirect()->route('dashboard.actualites.index')
            ->with('success', 'Actualité créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Actualite $actualite)
    {
        $actualite->load(['equipes', 'joueurs']);
        return Inertia::render('actualites/show', compact('actualite'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Actualite $actualite)
    {
        $actualite->load(['equipes', 'joueurs']);
        $equipes = Equipe::select('id', 'nom')->orderBy('nom')->get();
        $joueurs = Joueur::with('equipe')->select('id', 'nom', 'equipe_id')->orderBy('nom')->get();
        
        return Inertia::render('actualites/edit', compact('actualite', 'equipes', 'joueurs'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Actualite $actualite)
    {
        $validated = $request->validate([
            'type' => 'required|in:rumeur,transfert',
            'contenu' => 'required|string',
            'date' => 'required|date',
            'equipes' => 'nullable|array',
            'equipes.*' => 'exists:equipes,id',
            'joueurs' => 'nullable|array',
            'joueurs.*' => 'exists:joueurs,id',
        ]);

        $actualite->update([
            'type' => $validated['type'],
            'contenu' => $validated['contenu'],
            'date' => $validated['date'],
        ]);

        $actualite->equipes()->sync($validated['equipes'] ?? []);
        $actualite->joueurs()->sync($validated['joueurs'] ?? []);

        return redirect()->route('dashboard.actualites.index')
            ->with('success', 'Actualité mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Actualite $actualite)
    {
        $actualite->delete();
        return redirect()->route('dashboard.actualites.index')
            ->with('success', 'Actualité supprimée avec succès.');
    }

    /**
     * Page publique des actualités mercato.
     */
    public function publicIndex()
    {
        $actualites = Actualite::with(['equipes:id,nom,logo', 'joueurs:id,nom'])
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($actualite) {
                return [
                    'id' => $actualite->id,
                    'type' => $actualite->type,
                    'contenu' => $actualite->contenu,
                    'date' => $actualite->date,
                    'created_at' => $actualite->created_at,
                    'equipes' => $actualite->equipes,
                    'joueurs' => $actualite->joueurs,
                ];
            });

        return Inertia::render('actualites-mercato', [
            'actualites' => $actualites,
        ]);
    }

    /**
     * Upload d'une image depuis l'éditeur WYSIWYG
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $path = $request->file('image')->store('actualites', 'public');
        $url = Storage::url($path);

        return response()->json([
            'url' => asset($url),
        ]);
    }
}
