import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    coupeAvecPoule: any;
    modeles: CoupeAvecPouleModele[];
    equipes: Equipe[];
    selectedEquipeIds?: number[];
}

interface FormData {
    nom: string;
    nombre_equipes: number;
    nombre_poules: number;
    qualifies_par_poule: number;
    coupe_avec_poule_modele_id: number | '';
}

export default function CoupeAvecPouleEdit({ coupeAvecPoule, modeles, equipes, selectedEquipeIds = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        nom: coupeAvecPoule.nom || '',
        nombre_equipes: coupeAvecPoule.nombre_equipes || 8,
        nombre_poules: coupeAvecPoule.nombre_poules || 2,
        qualifies_par_poule: coupeAvecPoule.qualifies_par_poule || 2,
        coupe_avec_poule_modele_id: coupeAvecPoule.coupe_avec_poule_modele_id || '',
    });

    const [selectedModele, setSelectedModele] = React.useState<CoupeAvecPouleModele | null>(
        modeles.find(m => m.id === coupeAvecPoule.coupe_avec_poule_modele_id) || null
    );

    const [selection, setSelection] = React.useState<number[]>(selectedEquipeIds);

    // Assurer le pré-remplissage lorsque les props changent (navigation Inertia)
    React.useEffect(() => {
        setData({
            nom: coupeAvecPoule.nom || '',
            nombre_equipes: coupeAvecPoule.nombre_equipes || 8,
            nombre_poules: coupeAvecPoule.nombre_poules || 2,
            qualifies_par_poule: coupeAvecPoule.qualifies_par_poule || 2,
            coupe_avec_poule_modele_id: coupeAvecPoule.coupe_avec_poule_modele_id || '',
        });
        setSelectedModele(
            modeles.find(m => m.id === coupeAvecPoule.coupe_avec_poule_modele_id) || null
        );
        setSelection(Array.isArray(selectedEquipeIds) ? selectedEquipeIds : []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coupeAvecPoule.id]);

    const [addSelection, setAddSelection] = React.useState<number | ''>('');
    const notSelectedOptions = React.useMemo(() => (
        equipes.filter(e => !selection.includes(e.id)).map(e => ({ value: e.id, label: e.nom }))
    ), [equipes, selection]);

    const handleModeleChange = (modeleId: string) => {
        const value = modeleId === '' ? '' : Number(modeleId);
        setData('coupe_avec_poule_modele_id', value);
        const modele = modeles.find(m => m.id === Number(value));
        setSelectedModele(modele || null);
        
        if (modele) {
            setData('nombre_equipes', modele.nombre_equipes);
            setData('nombre_poules', modele.nombre_poules);
            setData('qualifies_par_poule', modele.qualifies_par_poule);
        }
    };

    const toggleEquipe = (id: number) => {
        setSelection((prev) => 
            prev.includes(id) 
                ? prev.filter(x => x !== id) 
                : (prev.length >= (data.nombre_equipes || 0) ? prev : [...prev, id])
        );
    };

    const saveSelection = () => {
        router.put(
            `/coupes-avec-poules/${coupeAvecPoule.id}`,
            { equipes: selection },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Forcer un rafraîchissement des props
                    router.reload({ only: ['selectedEquipeIds'] });
                },
            },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/coupes-avec-poules/${coupeAvecPoule.id}`);
    };

    const equipesParPoule = data.nombre_equipes / data.nombre_poules;
    const isValidConfiguration = data.nombre_equipes % data.nombre_poules === 0 && 
                                data.nombre_equipes >= data.nombre_poules * 2;

    return (
        <AppLayout>
            <Head title={`Éditer ${coupeAvecPoule.nom}`} />
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{coupeAvecPoule.nom}</h1>
                        {selectedModele && (
                            <div className="flex items-center space-x-2 mt-2">
                                {selectedModele.logo && (
                                    <img 
                                        src={selectedModele.logo} 
                                        alt={`Logo ${selectedModele.nom}`}
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Modèle: {selectedModele.nom}
                                </span>
                            </div>
                        )}
                    </div>
                    <Link href="/coupes-avec-poules" className="px-3 py-2 rounded bg-gray-600 text-white">
                        Retour
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        Équipes de la coupe
                                    </label>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {selection.length}/{data.nombre_equipes || 0} sélectionnées
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
                                        onClick={() => { 
                                            if (addSelection) { 
                                                toggleEquipe(Number(addSelection)); 
                                                setAddSelection(''); 
                                            } 
                                        }} 
                                        disabled={!addSelection || selection.length >= (data.nombre_equipes || 0)} 
                                        className="inline-flex items-center px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Ajouter
                                    </button>
                                    <button 
                                        onClick={saveSelection} 
                                        className="px-3 py-2 rounded bg-green-600 text-white"
                                    >
                                        Enregistrer
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
                                            {selection.map((id) => {
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
                                                            {e.nom}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setSelection(prev => prev.filter(x => x !== id))} 
                                                                className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700"
                                                            >
                                                                Retirer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {(errors as any).equipes && <p className="mt-1 text-sm text-red-600">{(errors as any).equipes}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Mise à jour...' : 'Mettre à jour'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
