<?php

namespace App\Http\Controllers;

use App\Models\HistoireEtape;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoireEtapeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $etapes = HistoireEtape::orderBy('ordre')->orderBy('date')->get();
        return Inertia::render('histoire-etapes/index', compact('etapes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('histoire-etapes/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'date_label' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'ordre' => 'nullable|integer|min:0',
            'actif' => 'boolean',
        ]);

        HistoireEtape::create($validated);

        return redirect()->route('dashboard.histoire-etapes.index')
            ->with('success', 'Étape créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(HistoireEtape $histoireEtape)
    {
        return Inertia::render('histoire-etapes/show', compact('histoireEtape'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $histoireEtape = HistoireEtape::findOrFail($id);
        return Inertia::render('histoire-etapes/edit', ['etape' => $histoireEtape]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $histoireEtape = HistoireEtape::findOrFail($id);
        
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'date_label' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'ordre' => 'nullable|integer|min:0',
            'actif' => 'boolean',
        ]);

        $histoireEtape->update($validated);

        return redirect()->route('dashboard.histoire-etapes.index')
            ->with('success', 'Étape mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $histoireEtape = HistoireEtape::findOrFail($id);
        $histoireEtape->delete();

        return redirect()->route('dashboard.histoire-etapes.index')
            ->with('success', 'Étape supprimée avec succès.');
    }
}
