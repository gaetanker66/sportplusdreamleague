<?php

namespace Database\Seeders;

use App\Models\CoupeModele;
use Illuminate\Database\Seeder;

class CoupeModeleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modeles = [
            [
                'nom' => 'Coupe du Monde',
                'description' => 'Modèle officiel de la Coupe du Monde FIFA',
                'logo' => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMCA2QzE0LjQ3NzEgNiAxMCAxMC40NzcxIDEwIDE2QzEwIDIxLjUyMjkgMTQuNDc3MSAyNiAyMCAyNkMyNS41MjI5IDI2IDMwIDIxLjUyMjkgMzAgMTZDMzAgMTAuNDc3MSAyNS41MjI5IDYgMjAgNloiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+',
                'actif' => true,
            ],
            [
                'nom' => 'Champions League',
                'description' => 'Modèle de la Ligue des Champions UEFA',
                'logo' => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiMwMDY2Q0MiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMCA4QzE0LjQ3NzEgOCAxMCAxMi40NzcxIDEwIDE4QzEwIDIzLjUyMjkgMTQuNDc3MSAyOCAyMCAyOEMyNS41MjI5IDI4IDMwIDIzLjUyMjkgMzAgMThDMzAgMTIuNDc3MSAyNS41MjI5IDggMjAgOFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+',
                'actif' => true,
            ],
            [
                'nom' => 'Coupe de France',
                'description' => 'Modèle de la Coupe de France',
                'logo' => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cmVjdCB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRkQ3MDAiLz4KPC9zdmc+',
                'actif' => true,
            ],
            [
                'nom' => 'Europa League',
                'description' => 'Modèle de la Ligue Europa UEFA',
                'logo' => 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMCAxMEMxNi42ODYzIDEwIDE0IDEyLjY4NjMgMTQgMTZDMTQgMTkuMzEzNyAxNi42ODYzIDIyIDIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPg==',
                'actif' => true,
            ],
        ];

        foreach ($modeles as $modele) {
            CoupeModele::create($modele);
        }
    }
}