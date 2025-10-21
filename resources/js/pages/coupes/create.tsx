import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';

interface CoupeModele {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    actif: boolean;
    nombre_equipes?: number;
}

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
}

interface Props {
    modeles: CoupeModele[];
    equipes: Equipe[];
}

export default function CoupeCreate({ modeles, equipes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        nombre_equipes: 16,
        coupe_modele_id: '',
        equipes: [] as number[],
        matchs_aleatoires: true,
        nombre_matchs: 1,
        victoire_uniquement: false,
    });

    const [selectedModele, setSelectedModele] = React.useState<CoupeModele | null>(null);
    const [addSelection, setAddSelection] = React.useState<number | ''>('');

    const notSelectedOptions = React.useMemo(() => (
        equipes.filter(e => !data.equipes.includes(e.id)).map(e => ({
            value: e.id,
            label: e.nom,
        }))
    ), [equipes, data.equipes]);

    const selectedEquipes = React.useMemo(() => (
        data.equipes.map(id => equipes.find(e => e.id === id)).filter(Boolean)
    ), [data.equipes, equipes]);

    const handleModeleChange = (modeleId: string) => {
        setData('coupe_modele_id', modeleId);
        const modele = modeles.find(m => m.id === Number(modeleId));
        setSelectedModele(modele || null);
        if (modele) {
            setData('nombre_equipes', modele.nombre_equipes || 16);
        }
    };

    const toggleEquipe = (id: number) => {
        const exists = data.equipes.includes(id);
        if (exists) {
            setData('equipes', data.equipes.filter(eid => eid !== id));
        } else {
            if (data.equipes.length >= (data.nombre_equipes || 0)) return;
            setData('equipes', [...data.equipes, id]);
        }
    };

    const handleAddEquipe = () => {
        if (!addSelection) return;
        toggleEquipe(Number(addSelection));
        setAddSelection('');
    };

    const handleMoveUp = (index: number) => {
        if (index > 0) {
            const newEquipes = [...data.equipes];
            [newEquipes[index - 1], newEquipes[index]] = [newEquipes[index], newEquipes[index - 1]];
            setData('equipes', newEquipes);
        }
    };

    const handleMoveDown = (index: number) => {
        if (index < data.equipes.length - 1) {
            const newEquipes = [...data.equipes];
            [newEquipes[index], newEquipes[index + 1]] = [newEquipes[index + 1], newEquipes[index]];
            setData('equipes', newEquipes);
        }
    };

    return (
        <AppLayout>
            <Head title="Créer une Coupe" />
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Coupe</h1>
                    <Link href="/coupes" className="px-3 py-2 rounded bg-gray-600 text-white">Retour</Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                        <form onSubmit={(e) => { e.preventDefault(); post('/coupes'); }} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom de la coupe
                                </label>
                                <input
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ex: Coupe de France 2024"
                                />
                                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Modèle de coupe (optionnel)
                                </label>
                                <select
                                    value={data.coupe_modele_id}
                                    onChange={(e) => handleModeleChange(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Aucun modèle</option>
                                    {modeles.map(modele => (
                                        <option key={modele.id} value={modele.id}>
                                            {modele.nom}
                                        </option>
                                    ))}
                                </select>
                                {selectedModele && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {selectedModele.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre d'équipes
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    step="2"
                                    value={data.nombre_equipes}
                                    onChange={(e) => setData('nombre_equipes', parseInt(e.target.value))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre de matchs par confrontation
                                </label>
                                <select
                                    value={data.nombre_matchs}
                                    onChange={(e) => setData('nombre_matchs', parseInt(e.target.value))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value={1}>1 match (élimination directe)</option>
                                    <option value={2}>2 matchs (aller-retour)</option>
                                    <option value={3}>3 matchs (meilleur de 3)</option>
                                    <option value={5}>5 matchs (meilleur de 5)</option>
                                    <option value={7}>7 matchs (meilleur de 7)</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {data.nombre_matchs === 1 
                                        ? "Match unique avec prolongations et tirs au but si nécessaire"
                                        : data.nombre_matchs === 2
                                        ? "Match aller et retour avec score cumulé"
                                        : `Première équipe à ${Math.ceil(data.nombre_matchs / 2)} victoires remporte la confrontation`
                                    }
                                </p>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="victoire_uniquement"
                                    checked={data.victoire_uniquement}
                                    onChange={(e) => setData('victoire_uniquement', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                                />
                                <label htmlFor="victoire_uniquement" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Victoire uniquement prise en compte ?
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Si coché, seules les victoires comptent (comme au basket). 
                                Les tirs au but seront pris en compte uniquement s'ils sont saisis lors du match.
                            </p>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="matchs_aleatoires"
                                    checked={data.matchs_aleatoires}
                                    onChange={(e) => setData('matchs_aleatoires', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                                />
                                <label htmlFor="matchs_aleatoires" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Matchs aléatoires
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Si coché, les équipes seront mélangées aléatoirement dans l'arbre. 
                                Sinon, vous pourrez choisir l'ordre des équipes.
                            </p>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sélectionner les équipes
                                    </label>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {data.equipes.length}/{data.nombre_equipes || 0} sélectionnées
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 mb-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Ajouter une équipe
                                        </label>
                                        <select
                                            value={addSelection}
                                            onChange={(e) => setAddSelection(e.target.value ? Number(e.target.value) : '')}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Rechercher/choisir une équipe à ajouter</option>
                                            {notSelectedOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddEquipe} 
                                        disabled={!addSelection || data.equipes.length >= (data.nombre_equipes || 0)} 
                                        className="inline-flex items-center px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Logo
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Nom
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {data.equipes.map((id, index) => {
                                                const e = equipes.find(eq => eq.id === id);
                                                if (!e) return null;
                                                return (
                                                    <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-4 py-2">
                                                            {e.logo ? (
                                                                <img 
                                                                    src={e.logo} 
                                                                    alt={e.nom} 
                                                                    className="h-8 w-8 rounded object-cover" 
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                    #{index + 1}
                                                                </span>
                                                                <span>{e.nom}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center space-x-1">
                                                                {!data.matchs_aleatoires && (
                                                                    <>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleMoveUp(index)}
                                                                            disabled={index === 0}
                                                                            className="px-2 py-1 rounded text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            title="Monter"
                                                                        >
                                                                            ↑
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleMoveDown(index)}
                                                                            disabled={index === data.equipes.length - 1}
                                                                            className="px-2 py-1 rounded text-white bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            title="Descendre"
                                                                        >
                                                                            ↓
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => toggleEquipe(id)} 
                                                                    className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Retirer
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {errors.equipes && <p className="mt-1 text-sm text-red-600">{errors.equipes}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || data.equipes.length !== data.nombre_equipes}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Création...' : 'Créer la coupe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


