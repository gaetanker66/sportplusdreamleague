import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import * as React from 'react';
import { TomSelectSingle as TomSingle, TomSelectMulti as TomMulti } from '@/components/tomselect';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Équipes', href: '/equipes' },
    { title: 'Modifier', href: '/equipes/edit' },
];

interface Poste { id: number; nom: string }

interface Joueur {
    id: number;
    nom: string;
    photo?: string;
    description?: string;
    poste?: Poste | null;
    postesSecondaires?: Poste[];
    // fallback pour la clé renvoyée par Laravel/Inertia
    postes_secondaires?: Poste[];
}

interface Equipe {
    id: number;
    nom: string;
    logo?: string;
    description?: string;
    rival_id?: number | null;
    rival?: { id: number; nom: string } | null;
    joueurs?: Joueur[];
}

type PlayerForm = {
    id: number;
    nom: string;
    poste_id: number | null;
    postes_secondaires: number[];
    photo: string | null;
    description: string | null;
};

type FormData = {
    nom: string;
    logo: string;
    description: string;
    rival_id: number | null;
    players: PlayerForm[];
};

interface Props {
    equipe: Equipe;
    postes?: Poste[];
    equipes?: { id: number; nom: string }[];
}

export default function EquipesEdit({ equipe, postes = [] as Poste[], equipes = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        nom: equipe.nom,
        logo: equipe.logo || '',
        description: equipe.description || '',
        rival_id: equipe.rival_id || null,
        players: (equipe.joueurs ?? []).map((j): PlayerForm => ({
            id: j.id,
            nom: j.nom,
            poste_id: j.poste?.id ?? null,
            postes_secondaires: (j.postesSecondaires ?? (j as any).postes_secondaires ?? []).map((p: any) => p.id),
            photo: j.photo ?? null,
            description: j.description ?? null,
        })),
    });

    const [newPlayerName, setNewPlayerName] = React.useState('');
    const [newPlayerPosteId, setNewPlayerPosteId] = React.useState<number | ''>(equipe.joueurs?.[0]?.poste?.id ? '' : '');
    const [newPlayerSecondaryIds, setNewPlayerSecondaryIds] = React.useState<number[]>([]);
    const [newPlayerPhoto, setNewPlayerPhoto] = React.useState<string>('');
    const [newPlayerDescription, setNewPlayerDescription] = React.useState<string>('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;
        router.post(`/equipes/${equipe.id}/joueurs`, {
            nom: newPlayerName,
            poste_id: newPlayerPosteId || null,
            postes_secondaires: newPlayerSecondaryIds,
            photo: newPlayerPhoto || undefined,
            description: newPlayerDescription || undefined,
        }, {
            onSuccess: () => {
                setNewPlayerName('');
                setNewPlayerDescription('');
            },
            preserveScroll: true,
        });
    };

    const handleUpdatePlayerLocal = (joueur: Joueur, patch: Partial<{ nom: string; poste_id: number | null; postes_secondaires: number[]; photo?: string; description?: string }>) => {
        setData('players', (data.players as any).map((p: any) => p.id === joueur.id ? { ...p, ...patch } : p));
    };

    const handleDeletePlayer = (joueur: Joueur) => {
        if (!confirm('Supprimer ce joueur ?')) return;
        router.delete(`/equipes/${equipe.id}/joueurs/${joueur.id}`, { preserveScroll: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/equipes/${equipe.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${equipe.nom}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier l'équipe : {equipe.nom}</h1>
                        <p className="text-gray-600 dark:text-gray-400">Mettez à jour les informations de l'équipe</p>
                    </div>
                    <Link href="/equipes" className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150">Retour</Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                                <input
                                    id="nom"
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.nom && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.description && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                            </div>

                            <div>
                                <label htmlFor="rival_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipe rivale</label>
                                <select
                                    id="rival_id"
                                    value={data.rival_id || ''}
                                    onChange={(e) => setData('rival_id', e.target.value ? Number(e.target.value) : null)}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Aucune équipe rivale</option>
                                    {equipes.map(e => (
                                        <option key={e.id} value={e.id}>{e.nom}</option>
                                    ))}
                                </select>
                                {equipe.rival && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Cette équipe est actuellement le rival de : <strong>{equipe.rival.nom}</strong>
                                    </p>
                                )}
                                {errors.rival_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.rival_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                                <input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => setData('logo', event.target?.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {data.logo && <img src={data.logo} alt="Aperçu du logo" className="mt-2 h-16 w-16 rounded object-cover" />}
                                {errors.logo && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link href="/equipes" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</Link>
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">{processing ? 'Mise à jour…' : 'Mettre à jour'}</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Joueurs</h2>
                        </div>

                        <form onSubmit={handleAddPlayer} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                                <input
                                    type="text"
                                    placeholder="Nom du joueur"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poste principal</label>
                                <TomSingle
                                    options={postes.map((p) => ({ value: p.id, label: p.nom }))}
                                    placeholder="Sélectionner un poste"
                                    value={newPlayerPosteId || ''}
                                    onChange={(val) => setNewPlayerPosteId(val ? Number(val) : '')}
                                    allowEmpty
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postes secondaires</label>
                                <TomMulti
                                    options={postes.map((p) => ({ value: p.id, label: p.nom }))}
                                    values={newPlayerSecondaryIds}
                                    placeholder="Choisir un ou plusieurs postes"
                                    onChange={(vals) => setNewPlayerSecondaryIds(vals)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => setNewPlayerPhoto(event.target?.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="mt-1 block w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    placeholder="Description du joueur"
                                    value={newPlayerDescription}
                                    onChange={(e) => setNewPlayerDescription(e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="lg:col-span-2 flex justify-end">
                                <button type="submit" className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Ajouter</button>
                            </div>
                        </form>

                        <div>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Photo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Poste principal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Postes secondaires</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(equipe.joueurs ?? []).map((joueur) => (
                                        <EditablePlayerRow
                                            key={joueur.id}
                                            joueur={joueur}
                                            equipeId={equipe.id}
                                            postes={postes}
                                            onChange={(patch) => handleUpdatePlayerLocal(joueur, patch)}
                                            onDelete={() => handleDeletePlayer(joueur)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function EditablePlayerRow({ joueur, equipeId, postes, onChange, onDelete }: { joueur: Joueur; equipeId: number; postes: Poste[]; onChange: (patch: Partial<{ nom: string; poste_id: number | null; postes_secondaires: number[]; photo?: string; description?: string }>) => void; onDelete: () => void; }) {
    const [name, setName] = React.useState(joueur.nom);
    const [posteId, setPosteId] = React.useState<number | ''>(joueur.poste?.id ?? '');
    const [secondaryIds, setSecondaryIds] = React.useState<number[]>(
        (joueur.postesSecondaires ?? (joueur as any).postes_secondaires ?? []).map((p: any) => p.id)
    );
    const [photo, setPhoto] = React.useState<string>(joueur.photo || '');
    const [description, setDescription] = React.useState<string>(joueur.description || '');
    React.useEffect(() => { onChange({ nom: name }); }, [name]);
    React.useEffect(() => { onChange({ poste_id: posteId ? Number(posteId) : null }); }, [posteId]);
    React.useEffect(() => { onChange({ postes_secondaires: secondaryIds }); }, [secondaryIds]);
    React.useEffect(() => { onChange({ photo: photo || undefined }); }, [photo]);
    React.useEffect(() => { onChange({ description: description || undefined }); }, [description]);

    // Sauvegarde immédiate des postes secondaires et de la description pour éviter toute perte
    React.useEffect(() => {
        // Envoi vers l'endpoint dédié de mise à jour du joueur
        router.put(`/equipes/${equipeId}/joueurs/${joueur.id}`,
            {
                nom: name,
                poste_id: posteId ? Number(posteId) : null,
                photo: photo || null,
                description: description || null,
                postes_secondaires: secondaryIds,
            },
            { preserveScroll: true, preserveState: true }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondaryIds, description]);

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
                {photo ? (
                    <img src={photo} alt={name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />)
                }
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <TomSingle
                    options={postes.map((p) => ({ value: p.id, label: p.nom }))}
                    placeholder="Poste"
                    value={posteId || ''}
                    onChange={(val) => setPosteId(val ? Number(val) : '')}
                    allowEmpty
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <TomMulti
                    options={postes.map((p) => ({ value: p.id, label: p.nom }))}
                    values={secondaryIds}
                    placeholder="Postes"
                    onChange={(vals) => setSecondaryIds(vals)}
                />
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full max-w-md px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                    placeholder="Description du joueur"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                <label className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => setPhoto(event.target?.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                        className="hidden"
                    />
                    Photo
                </label>
                <button onClick={onDelete} className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700">Supprimer</button>
            </td>
        </tr>
    );
}
