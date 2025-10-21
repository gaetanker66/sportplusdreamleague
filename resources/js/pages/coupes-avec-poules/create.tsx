import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';
import { TomSelectSingle as TomSingle } from '@/components/tomselect';

interface CoupeAvecPouleModele {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    nombre_equipes: number;
    nombre_poules: number;
    qualifies_par_poule: number;
}

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
}

interface Props {
    modeles: CoupeAvecPouleModele[];
    equipes: Equipe[];
}

export default function CoupeAvecPouleCreate({ modeles, equipes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        nombre_equipes: 8,
        nombre_poules: 2,
        qualifies_par_poule: 2,
        coupe_avec_poule_modele_id: '',
        equipes: [] as number[],
        matchs_aleatoires: true,
    });

    const [selectedModele, setSelectedModele] = React.useState<CoupeAvecPouleModele | null>(null);
    const [addSelection, setAddSelection] = React.useState<number | ''>('');
    
    const notSelectedOptions = React.useMemo(() => (
        equipes.filter(e => !data.equipes.includes(e.id)).map(e => ({ value: e.id, label: e.nom }))
    ), [equipes, data.equipes]);

    const handleModeleChange = (modeleId: string) => {
        setData('coupe_avec_poule_modele_id', modeleId);
        const modele = modeles.find(m => m.id === Number(modeleId));
        setSelectedModele(modele || null);
        
        if (modele) {
            setData('nombre_equipes', modele.nombre_equipes);
            setData('nombre_poules', modele.nombre_poules);
            setData('qualifies_par_poule', modele.qualifies_par_poule);
        }
    };

    const toggleEquipe = (id: number) => {
        const exists = data.equipes.includes(id);
        if (exists) {
            setData('equipes', data.equipes.filter(eid => eid !== id));
        } else {
            if (data.equipes.length >= (data.nombre_equipes || 0)) return; // ne pas dépasser
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

    const equipesParPoule = data.nombre_equipes / data.nombre_poules;
    const isValidConfiguration = data.nombre_equipes % data.nombre_poules === 0 && 
                                data.nombre_equipes >= data.nombre_poules * 2;

    return (
        <AppLayout>
            <Head title="Créer une Coupe avec Poules" />
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Coupe avec Poules</h1>
                    <Link 
                        href="/coupes-avec-poules" 
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={(e) => { e.preventDefault(); post('/coupes-avec-poules'); }} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom de la coupe
                                </label>
                                <input
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ex: Ligue des Champions 2024"
                                />
                                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Modèle de coupe (optionnel)
                                </label>
                                <select
                                    value={data.coupe_avec_poule_modele_id}
                                    onChange={(e) => handleModeleChange(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Aucun modèle</option>
                                    {modeles.map(modele => (
                                        <option key={modele.id} value={modele.id}>
                                            {modele.nom} ({modele.nombre_equipes} équipes, {modele.nombre_poules} poules)
                                        </option>
                                    ))}
                                </select>
                                {selectedModele && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {selectedModele.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nombre d'équipes
                                    </label>
                                    <input
                                        type="number"
                                        min="4"
                                        step="2"
                                        value={data.nombre_equipes}
                                        onChange={(e) => setData('nombre_equipes', parseInt(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nombre de poules
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        value={data.nombre_poules}
                                        onChange={(e) => setData('nombre_poules', parseInt(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Qualifiés par poule
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={equipesParPoule}
                                        value={data.qualifies_par_poule}
                                        onChange={(e) => setData('qualifies_par_poule', parseInt(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

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
                                Si coché, les équipes seront mélangées aléatoirement dans les poules. 
                                Sinon, vous pourrez choisir l'emplacement des équipes.
                            </p>

                            {!isValidConfiguration && (
                                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Configuration invalide : Le nombre d'équipes doit être divisible par le nombre de poules.
                                        Chaque poule doit avoir au moins 2 équipes.
                                    </p>
                                </div>
                            )}

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
                                        <TomSingle 
                                            options={notSelectedOptions} 
                                            value={addSelection} 
                                            onChange={(val) => setAddSelection(val ? Number(val) : '')} 
                                            allowEmpty 
                                            placeholder="Rechercher/choisir une équipe à ajouter" 
                                        />
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

                            {/* Affichage des poules en temps réel */}
                            {!data.matchs_aleatoires && data.equipes.length > 0 && isValidConfiguration && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Aperçu des poules
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {Array.from({ length: data.nombre_poules }, (_, pouleIndex) => {
                                            const equipesParPoule = Math.floor(data.equipes.length / data.nombre_poules);
                                            const startIndex = pouleIndex * equipesParPoule;
                                            const endIndex = startIndex + equipesParPoule;
                                            const equipesIdsPoule = data.equipes.slice(startIndex, endIndex);
                                            const equipesPoule = equipesIdsPoule.map(id => equipes.find(e => e.id === id)).filter(Boolean);
                                            const pouleNom = String.fromCharCode(65 + pouleIndex); // A, B, C, etc.
                                            
                                            return (
                                                <div key={pouleIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                        Poule {pouleNom}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {equipesPoule.length > 0 ? (
                                                            equipesPoule.map((equipe, index) => {
                                                                if (!equipe) return null;
                                                                return (
                                                                    <div key={equipe.id} className="flex items-center space-x-2">
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                                                                            {index + 1}.
                                                                        </span>
                                                                        {equipe.logo && (
                                                                            <img 
                                                                                src={equipe.logo} 
                                                                                alt={equipe.nom}
                                                                                className="w-5 h-5 rounded object-cover"
                                                                            />
                                                                        )}
                                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                                            {equipe.nom}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                Aucune équipe assignée
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Les équipes sont réparties dans l'ordre de sélection. 
                                        Les {data.qualifies_par_poule} premières équipes de chaque poule se qualifieront.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || !isValidConfiguration || data.equipes.length !== data.nombre_equipes}
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
