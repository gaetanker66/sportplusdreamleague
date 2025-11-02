<?php

namespace App\Http\Controllers;

use App\Models\CoupeAvecPouleModele;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoupeAvecPouleModeleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Optimisation : ne pas charger les logos pour éviter l'épuisement mémoire
        $modeles = CoupeAvecPouleModele::select('id', 'nom', 'description', 'nombre_equipes', 'nombre_poules', 'qualifies_par_poule', 'actif', 'created_at', 'updated_at')
            ->orderBy('nom')
            ->get();
        
        return Inertia::render('coupe-avec-poule-modeles/index', [
            'modeles' => $modeles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('coupe-avec-poule-modeles/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'nombre_equipes' => 'required|integer|min:4',
            'nombre_poules' => 'required|integer|min:2',
            'qualifies_par_poule' => 'required|integer|min:1',
            'actif' => 'boolean'
        ]);

        CoupeAvecPouleModele::create([
            'nom' => $request->nom,
            'logo' => $request->logo,
            'description' => $request->description,
            'nombre_equipes' => $request->nombre_equipes,
            'nombre_poules' => $request->nombre_poules,
            'qualifies_par_poule' => $request->qualifies_par_poule,
            'actif' => $request->actif ?? true
        ]);

        return redirect()->route('coupe-avec-poule-modeles.index')
                        ->with('success', 'Modèle de coupe avec poules créé avec succès');
    }

    /**
     * Display the specified resource.
     */
    public function show(CoupeAvecPouleModele $coupeAvecPouleModele)
    {
        return Inertia::render('coupe-avec-poule-modeles/show', [
            'modele' => $coupeAvecPouleModele
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CoupeAvecPouleModele $coupeAvecPouleModele)
    {
        return Inertia::render('coupe-avec-poule-modeles/edit', [
            'modele' => $coupeAvecPouleModele
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CoupeAvecPouleModele $coupeAvecPouleModele)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'nombre_equipes' => 'required|integer|min:4',
            'nombre_poules' => 'required|integer|min:2',
            'qualifies_par_poule' => 'required|integer|min:1',
            'actif' => 'boolean'
        ]);

        $coupeAvecPouleModele->update([
            'nom' => $request->nom,
            'logo' => $request->logo,
            'description' => $request->description,
            'nombre_equipes' => $request->nombre_equipes,
            'nombre_poules' => $request->nombre_poules,
            'qualifies_par_poule' => $request->qualifies_par_poule,
            'actif' => $request->actif ?? true
        ]);

        return redirect()->route('coupe-avec-poule-modeles.index')
                        ->with('success', 'Modèle de coupe avec poules mis à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CoupeAvecPouleModele $coupeAvecPouleModele)
    {
        $coupeAvecPouleModele->delete();

        return redirect()->route('coupe-avec-poule-modeles.index')
                        ->with('success', 'Modèle de coupe avec poules supprimé avec succès');
    }

    /**
     * API : Récupérer les logos des modèles de coupes avec poules par leurs IDs
     */
    public function getLogos(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:coupe_avec_poule_modeles,id',
        ]);

        $modeles = CoupeAvecPouleModele::whereIn('id', $validated['ids'])
            ->select('id', 'logo')
            ->get()
            ->mapWithKeys(function ($modele) {
                return [$modele->id => $modele->logo];
            });

        return response()->json($modeles);
    }
}
