<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

// Pages publiques: accueil, classement, statistiques, calendrier, coupes, équipes
Route::get('classement', [App\Http\Controllers\PublicController::class, 'classement'])->name('public.classement');
Route::get('statistiques', [App\Http\Controllers\PublicController::class, 'statistiques'])->name('public.statistiques');
Route::get('calendrier', [App\Http\Controllers\PublicController::class, 'calendrier'])->name('public.calendrier');
Route::get('tournois', [App\Http\Controllers\PublicController::class, 'coupes'])->name('public.coupes');
Route::get('equipes', [App\Http\Controllers\PublicController::class, 'equipes'])->name('public.equipes');
Route::get('equipes/{equipe}', [App\Http\Controllers\EquipeController::class, 'show'])->name('equipes.show');
Route::get('joueurs/{joueur}', [App\Http\Controllers\PublicController::class, 'joueur'])->name('joueurs.show');
Route::get('histoire', [App\Http\Controllers\PublicController::class, 'histoire'])->name('public.histoire');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('dashboard');
    })->name('index');
    
    // Routes pour la gestion des ligues
    Route::resource('ligues', App\Http\Controllers\LigueController::class);
    
    // Routes pour la gestion des saisons
    Route::resource('saisons', App\Http\Controllers\SaisonController::class);

    // Routes pour la gestion des équipes (sauf show qui est publique)
    Route::resource('equipes', App\Http\Controllers\EquipeController::class)->except(['show']);
    Route::post('equipes/{equipe}/joueurs', [App\Http\Controllers\EquipeController::class, 'addPlayer'])->name('equipes.joueurs.store');
    Route::put('equipes/{equipe}/joueurs/{joueur}', [App\Http\Controllers\EquipeController::class, 'updatePlayer'])->name('equipes.joueurs.update');
    Route::delete('equipes/{equipe}/joueurs/{joueur}', [App\Http\Controllers\EquipeController::class, 'deletePlayer'])->name('equipes.joueurs.destroy');
    
    // Routes API pour les logos
    Route::post('api/equipes/logos', [App\Http\Controllers\EquipeController::class, 'getLogos'])->name('api.equipes.logos');
    Route::post('api/coupe-modeles/logos', [App\Http\Controllers\CoupeModeleController::class, 'getLogos'])->name('api.coupe-modeles.logos');
    Route::post('api/coupe-avec-poule-modeles/logos', [App\Http\Controllers\CoupeAvecPouleModeleController::class, 'getLogos'])->name('api.coupe-avec-poule-modeles.logos');
    Route::post('api/ligues/logos', [App\Http\Controllers\LigueController::class, 'getLogos'])->name('api.ligues.logos');

    // Routes pour la gestion des postes
    Route::resource('postes', App\Http\Controllers\PosteController::class);

    // Routes pour la gestion des transferts
    Route::resource('transferts', App\Http\Controllers\TransfertController::class);

    // Journées & matchs
    Route::post('saisons/{saison}/journees', [App\Http\Controllers\JourneeController::class, 'store'])->name('journees.store');
    Route::post('saisons/{saison}/journees/generate', [App\Http\Controllers\JourneeController::class, 'generate'])->name('journees.generate');
    Route::post('journees/{journee}/matchs', [App\Http\Controllers\JourneeController::class, 'addMatch'])->name('journees.matchs.store');
    Route::post('matchs/{match}/buts', [App\Http\Controllers\MatchController::class, 'addBut'])->name('matchs.buts.store');
    Route::delete('matchs/{match}/buts/{but}', [App\Http\Controllers\MatchController::class, 'removeBut'])->name('matchs.buts.destroy');
    Route::post('matchs/{match}/cartons', [App\Http\Controllers\MatchController::class, 'addCarton'])->name('matchs.cartons.store');
    Route::delete('matchs/{match}/cartons/{carton}', [App\Http\Controllers\MatchController::class, 'removeCarton'])->name('matchs.cartons.destroy');
    Route::put('matchs/{match}', [App\Http\Controllers\MatchController::class, 'updateGardienEtArrets'])->name('matchs.update');
    Route::get('matchs/{match}/edit', [App\Http\Controllers\MatchController::class, 'edit'])->name('matchs.edit');

    // Coupes (dashboard)
    Route::resource('coupes', App\Http\Controllers\CoupeController::class);
    Route::post('coupes/{coupe}/generate', [App\Http\Controllers\CoupeController::class, 'generateBracket'])->name('coupes.generate');
    Route::post('coupe-rounds/{round}/advance', [App\Http\Controllers\CoupeController::class, 'advanceWinners'])->name('coupes.advance');
    Route::put('coupe-matchs/{match}', [App\Http\Controllers\CoupeController::class, 'updateMatch'])->name('coupes.matchs.update');
    Route::get('coupe-matchs/{match}/edit', [App\Http\Controllers\CoupeController::class, 'editMatch'])->name('coupes.matchs.edit');
    Route::post('coupe-matchs/{match}/buts', [App\Http\Controllers\CoupeController::class, 'addBut'])->name('coupes.matchs.buts.store');
    Route::delete('coupe-matchs/{match}/buts/{but}', [App\Http\Controllers\CoupeController::class, 'removeBut'])->name('coupes.matchs.buts.destroy');
    Route::post('coupe-matchs/{match}/cartons', [App\Http\Controllers\CoupeController::class, 'addCarton'])->name('coupes.matchs.cartons.store');
    Route::delete('coupe-matchs/{match}/cartons/{carton}', [App\Http\Controllers\CoupeController::class, 'removeCarton'])->name('coupes.matchs.cartons.destroy');
    Route::post('coupes/{coupe}/recalculer', [App\Http\Controllers\CoupeController::class, 'recalculerVainqueurs'])->name('coupes.recalculer');

    // Modèles de coupe (dashboard)
    Route::resource('coupe-modeles', App\Http\Controllers\CoupeModeleController::class);

    // Coupes avec poules (dashboard)
    Route::resource('coupes-avec-poules', App\Http\Controllers\CoupeAvecPouleController::class);
    Route::post('coupes-avec-poules/{coupes_avec_poule}/finaliser', [App\Http\Controllers\CoupeAvecPouleController::class, 'finaliserEtGenererPhaseFinale'])->name('coupes-avec-poules.finaliser');
    // Edition matchs de poule
    Route::get('poule-matchs/{poule_match}/edit', [App\Http\Controllers\PouleMatchController::class, 'edit'])->name('poule-matchs.edit');
    Route::put('poule-matchs/{poule_match}', [App\Http\Controllers\PouleMatchController::class, 'update'])->name('poule-matchs.update');
    Route::post('poule-matchs/{poule_match}/buts', [App\Http\Controllers\PouleMatchController::class, 'addBut'])->name('poule-matchs.buts.store');
    Route::delete('poule-matchs/{poule_match}/buts/{but}', [App\Http\Controllers\PouleMatchController::class, 'removeBut'])->name('poule-matchs.buts.destroy');
    Route::post('poule-matchs/{poule_match}/cartons', [App\Http\Controllers\PouleMatchController::class, 'addCarton'])->name('poule-matchs.cartons.store');
    Route::delete('poule-matchs/{poule_match}/cartons/{carton}', [App\Http\Controllers\PouleMatchController::class, 'removeCarton'])->name('poule-matchs.cartons.destroy');
    
    // Modèles de coupes avec poules (dashboard)
    Route::resource('coupe-avec-poule-modeles', App\Http\Controllers\CoupeAvecPouleModeleController::class);

    // Gestion de l'histoire (dashboard)
    Route::resource('histoire-etapes', App\Http\Controllers\HistoireEtapeController::class);

    // Administration des utilisateurs (réservé aux administrateurs)
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', App\Http\Controllers\Admin\UserController::class);
    });

});

// Route pour servir le logo depuis resources/images
Route::get('logo.svg', function () {
    $logoPath = resource_path('images/logo.svg');
    if (file_exists($logoPath)) {
        return response()->file($logoPath, ['Content-Type' => 'image/svg+xml']);
    }
    abort(404);
})->name('logo');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
