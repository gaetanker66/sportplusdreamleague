<?php

namespace App\Http\Controllers;

use App\Models\CoupeModele;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoupeModeleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $modeles = CoupeModele::orderBy('nom')->get();
        
        return Inertia::render('coupe-modeles/index', [
            'modeles' => $modeles,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('coupe-modeles/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        CoupeModele::create($validated);

        return redirect()->route('coupe-modeles.index')->with('success', 'Modèle de coupe créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CoupeModele $coupeModele)
    {
        $coupeModele->load('coupes');
        
        return Inertia::render('coupe-modeles/show', [
            'modele' => $coupeModele,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CoupeModele $coupeModele)
    {
        return Inertia::render('coupe-modeles/edit', [
            'modele' => $coupeModele,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CoupeModele $coupeModele)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $coupeModele->update($validated);

        return redirect()->route('coupe-modeles.index')->with('success', 'Modèle de coupe mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CoupeModele $coupeModele)
    {
        // Vérifier s'il y a des coupes qui utilisent ce modèle
        if ($coupeModele->coupes()->count() > 0) {
            return back()->with('error', 'Ce modèle ne peut pas être supprimé car il est utilisé par des coupes.');
        }

        $coupeModele->delete();

        return redirect()->route('coupe-modeles.index')->with('success', 'Modèle de coupe supprimé avec succès.');
    }
}