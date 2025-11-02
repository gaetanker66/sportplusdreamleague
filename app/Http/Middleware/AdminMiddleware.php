<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est connecté
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Pour l'instant, on considère que le premier utilisateur est admin
        // Vous pouvez modifier cette logique selon vos besoins
        $isAdmin = auth()->user()->id === 1 || auth()->user()->email === 'admin@sportplusdreamleague.fr';

        if (!$isAdmin) {
            abort(403, 'Accès refusé. Seuls les administrateurs peuvent accéder à cette section.');
        }

        return $next($request);
    }
}