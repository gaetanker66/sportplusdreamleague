<?php

namespace App\Http\Controllers;

use App\Models\Poste;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosteController extends Controller
{
    public function index()
    {
        $postes = Poste::orderBy('nom')->get();
        return Inertia::render('postes/index', compact('postes'));
    }

    public function create()
    {
        return Inertia::render('postes/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        Poste::create($validated);

        return redirect()->route('postes.index')->with('success', 'Poste créé avec succès.');
    }

    public function show(Poste $poste)
    {
        return Inertia::render('postes/show', compact('poste'));
    }

    public function edit(Poste $poste)
    {
        return Inertia::render('postes/edit', compact('poste'));
    }

    public function update(Request $request, Poste $poste)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        $poste->update($validated);

        return redirect()->route('postes.index')->with('success', 'Poste mis à jour avec succès.');
    }

    public function destroy(Poste $poste)
    {
        $poste->delete();
        return redirect()->route('postes.index')->with('success', 'Poste supprimé avec succès.');
    }
}


