<?php

namespace App\Http\Controllers;

use App\Models\Ligue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LigueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ligues = Ligue::all();
        return Inertia::render('ligues/index', compact('ligues'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('ligues/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'niveau' => 'required|integer|min:1|unique:ligues,niveau',
            'nombre_equipes' => 'required|integer|min:0'
        ]);

        Ligue::create($request->all());

        return redirect()->route('ligues.index')
            ->with('success', 'Ligue créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Ligue $ligue)
    {
        return Inertia::render('ligues/show', compact('ligue'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ligue $ligue)
    {
        return Inertia::render('ligues/edit', compact('ligue'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ligue $ligue)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'niveau' => 'required|integer|min:1|unique:ligues,niveau,' . $ligue->id,
            'nombre_equipes' => 'required|integer|min:0'
        ]);

        $ligue->update($request->all());

        return redirect()->route('ligues.index')
            ->with('success', 'Ligue mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ligue $ligue)
    {
        $ligue->delete();

        return redirect()->route('ligues.index')
            ->with('success', 'Ligue supprimée avec succès.');
    }
}
