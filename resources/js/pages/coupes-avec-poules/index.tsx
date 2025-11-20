import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';

interface CoupeAvecPouleModele {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
}

interface CoupeAvecPoule {
    id: number;
    nom: string;
    nombre_equipes: number;
    nombre_poules: number;
    qualifies_par_poule: number;
    phase_finale_generee: boolean;
    modele?: CoupeAvecPouleModele;
    created_at: string;
}

interface Props {
    coupesAvecPoules: CoupeAvecPoule[];
}

export default function CoupesAvecPoulesIndex({ coupesAvecPoules }: Props) {
    const { delete: destroy } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette coupe avec poules ?')) {
            destroy(`/dashboard/coupes-avec-poules/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Coupes avec Poules" />
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupes avec Poules</h1>
                    <div className="flex gap-3">
                        <Link 
                            href="/dashboard/coupe-avec-poule-modeles" 
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Modèles
                        </Link>
                        <Link 
                            href="/dashboard/coupes-avec-poules/create" 
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Nouvelle Coupe
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Nom
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Modèle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Équipes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Poules
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Qualifiés/Poule
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {coupesAvecPoules.map((coupe) => (
                                <tr key={coupe.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {coupe.nom}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupe.modele ? (
                                            <div className="flex items-center">
                                                {coupe.modele.logo && (
                                                    <img 
                                                        src={coupe.modele.logo} 
                                                        alt={coupe.modele.nom}
                                                        className="w-6 h-6 mr-2 rounded"
                                                    />
                                                )}
                                                {coupe.modele.nom}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Aucun modèle</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupe.nombre_equipes}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupe.nombre_poules}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupe.qualifies_par_poule}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            coupe.phase_finale_generee 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {coupe.phase_finale_generee ? 'Phase finale' : 'Phase de poules'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/dashboard/coupes-avec-poules/${coupe.id}`}
                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Voir
                                            </Link>
                                            <Link
                                                href={`/dashboard/coupes-avec-poules/${coupe.id}/edit`}
                                                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                            >
                                                Modifier
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(coupe.id)}
                                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
