import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { TomSelectSingle as TomSingle } from '@/components/tomselect';
import * as React from 'react';

export default function CoupeMatchEdit({ match, homeGardiens = [], awayGardiens = [], homePlayers = [], awayPlayers = [] }: { match: any; homeGardiens?: {id:number; nom:string}[]; awayGardiens?: {id:number; nom:string}[]; homePlayers?: {id:number; nom:string}[]; awayPlayers?: {id:number; nom:string}[] }) {
  const form = useForm({
    gardien_home_id: match.gardien_home_id ?? '',
    gardien_away_id: match.gardien_away_id ?? '',
    arrets_home: (match.arrets_home ?? '') as any,
    arrets_away: (match.arrets_away ?? '') as any,
    termine: match.termine ?? false,
    is_fake: match.is_fake ?? false,
    tirs_au_but_home: match.tirs_au_but_home ?? null,
    tirs_au_but_away: match.tirs_au_but_away ?? null,
    homme_du_match_id: match.homme_du_match_id ?? '',
  });
  const [cartonHome, setCartonHome] = React.useState<{ joueur_id: number | ''; type: 'jaune' | 'rouge' | ''; minute: number | '' }>({ joueur_id: '', type: '', minute: '' });
  const [cartonAway, setCartonAway] = React.useState<{ joueur_id: number | ''; type: 'jaune' | 'rouge' | ''; minute: number | '' }>({ joueur_id: '', type: '', minute: '' });
  const addCartonHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartonHome.joueur_id || !cartonHome.type) return;
    router.post(`/dashboard/coupe-matchs/${match.id}/cartons`, { joueur_id: cartonHome.joueur_id, type: cartonHome.type, minute: cartonHome.minute || null, stay: true }, { 
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Carton ajouté avec succès.');
        setCartonHome({ joueur_id: '', type: '', minute: '' });
      },
      onError: () => {
        toast.error('Erreur lors de l\'ajout du carton.');
      }
    });
  };
  const addCartonAway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartonAway.joueur_id || !cartonAway.type) return;
    router.post(`/dashboard/coupe-matchs/${match.id}/cartons`, { joueur_id: cartonAway.joueur_id, type: cartonAway.type, minute: cartonAway.minute || null, stay: true }, { 
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Carton ajouté avec succès.');
        setCartonAway({ joueur_id: '', type: '', minute: '' });
      },
      onError: () => {
        toast.error('Erreur lors de l\'ajout du carton.');
      }
    });
  };

  const removeCarton = (cartonId: number) => {
    router.delete(`/dashboard/coupe-matchs/${match.id}/cartons/${cartonId}`, { 
      data: { stay: true }, 
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Carton supprimé avec succès.');
      },
      onError: () => {
        toast.error('Erreur lors de la suppression du carton.');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent)=> {
    e.preventDefault();
    form.transform((data:any) => ({
      gardien_home_id: data.gardien_home_id ? Number(data.gardien_home_id) : null,
      gardien_away_id: data.gardien_away_id ? Number(data.gardien_away_id) : null,
      arrets_home: data.arrets_home === '' ? null : Number(data.arrets_home),
      arrets_away: data.arrets_away === '' ? null : Number(data.arrets_away),
      termine: !!data.termine,
      is_fake: !!data.is_fake,
      tirs_au_but_home: data.tirs_au_but_home === null || data.tirs_au_but_home === '' ? null : Number(data.tirs_au_but_home),
      tirs_au_but_away: data.tirs_au_but_away === null || data.tirs_au_but_away === '' ? null : Number(data.tirs_au_but_away),
      homme_du_match_id: data.homme_du_match_id ? Number(data.homme_du_match_id) : null,
    }));
    form.put(`/dashboard/coupe-matchs/${match.id}`, { 
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Match enregistré avec succès.');
      },
      onError: () => {
        toast.error('Erreur lors de l\'enregistrement du match.');
      }
    });
  };
  const playerName = (id?: number | null) => {
    if (!id) return '';
    const p = [...homePlayers, ...awayPlayers].find(p => p.id === id);
    return p ? p.nom : `#${id}`;
  };
  return (
    <AppLayout>
      <Head title={`Modifier match de coupe #${match.id}`} />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{match.home_equipe?.nom} vs {match.away_equipe?.nom}</h1>
          <Link href={`/dashboard/coupes/${match.round?.coupe?.id}/edit`} className="px-3 py-2 rounded bg-gray-600 text-white">Retour</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Gardien domicile</label>
              <TomSingle
                options={homeGardiens?.map((j:any) => ({ value: j.id, label: j.nom })) || []}
                value={form.data.gardien_home_id || ''}
                onChange={(val) => form.setData('gardien_home_id', val ? Number(val) : '')}
                placeholder="Rechercher un gardien..."
                allowEmpty
              />
              {form.errors.gardien_home_id && <p className="mt-1 text-xs text-red-500">{form.errors.gardien_home_id}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Gardien extérieur</label>
              <TomSingle
                options={awayGardiens?.map((j:any) => ({ value: j.id, label: j.nom })) || []}
                value={form.data.gardien_away_id || ''}
                onChange={(val) => form.setData('gardien_away_id', val ? Number(val) : '')}
                placeholder="Rechercher un gardien..."
                allowEmpty
              />
              {form.errors.gardien_away_id && <p className="mt-1 text-xs text-red-500">{form.errors.gardien_away_id}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Arrêts domicile</label>
              <input type="number" min={0} value={form.data.arrets_home as any} onChange={(e)=> form.setData('arrets_home', e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              {form.errors.arrets_home && <p className="mt-1 text-xs text-red-500">{form.errors.arrets_home}</p>}
            </div>
            <div>
              <label className="block text-sm">Arrêts extérieur</label>
              <input type="number" min={0} value={form.data.arrets_away as any} onChange={(e)=> form.setData('arrets_away', e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              {form.errors.arrets_away && <p className="mt-1 text-xs text-red-500">{form.errors.arrets_away}</p>}
            </div>
            <div>
              <label className="block text-sm">Tirs au but domicile</label>
              <input type="number" min={0} value={form.data.tirs_au_but_home as any} onChange={(e)=> form.setData('tirs_au_but_home', e.target.value === '' ? null : Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              {form.errors.tirs_au_but_home && <p className="mt-1 text-xs text-red-500">{form.errors.tirs_au_but_home}</p>}
            </div>
            <div>
              <label className="block text-sm">Tirs au but extérieur</label>
              <input type="number" min={0} value={form.data.tirs_au_but_away as any} onChange={(e)=> form.setData('tirs_au_but_away', e.target.value === '' ? null : Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              {form.errors.tirs_au_but_away && <p className="mt-1 text-xs text-red-500">{form.errors.tirs_au_but_away}</p>}
            </div>
          </div>
          {/* Les scores sont calculés automatiquement via les buts */}
          <div>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.data.termine} onChange={(e)=> form.setData('termine', e.target.checked)} /> Match terminé</label>
          </div>
          <div>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.data.is_fake} onChange={(e)=> form.setData('is_fake', e.target.checked)} /> Faux match (exempt)</label>
          </div>
          <div>
            <label className="block text-sm mb-1">Homme du match (optionnel)</label>
            <TomSingle
              options={[...homePlayers, ...awayPlayers].map((j: any) => ({ value: j.id, label: j.nom }))}
              value={form.data.homme_du_match_id || ''}
              onChange={(val) => form.setData('homme_du_match_id', val ? Number(val) : '')}
              placeholder="Rechercher un joueur..."
              allowEmpty
            />
            {form.errors.homme_du_match_id && <p className="mt-1 text-xs text-red-500">{form.errors.homme_du_match_id}</p>}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={form.processing} className="px-4 py-2 rounded bg-indigo-600 text-white">Enregistrer</button>
          </div>
        </form>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddGoals title={`Ajouter but - ${match.home_equipe?.nom}`} teamId={match.equipe_home_id} matchId={match.id} players={homePlayers} opponentPlayers={awayPlayers} />
          <AddGoals title={`Ajouter but - ${match.away_equipe?.nom}`} teamId={match.equipe_away_id} matchId={match.id} players={awayPlayers} opponentPlayers={homePlayers} />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GoalList title={`Buts ${match.home_equipe?.nom}`} goals={(match.buts||[]).filter((b:any)=> b.equipe_id === match.equipe_home_id)} onRemove={(id:number)=> router.delete(`/dashboard/coupe-matchs/${match.id}/buts/${id}`, { 
            preserveScroll: true,
            onSuccess: () => toast.success('But supprimé avec succès.'),
            onError: () => toast.error('Erreur lors de la suppression du but.')
          })} players={[...homePlayers, ...awayPlayers]} />
          <GoalList title={`Buts ${match.away_equipe?.nom}`} goals={(match.buts||[]).filter((b:any)=> b.equipe_id === match.equipe_away_id)} onRemove={(id:number)=> router.delete(`/dashboard/coupe-matchs/${match.id}/buts/${id}`, { 
            preserveScroll: true,
            onSuccess: () => toast.success('But supprimé avec succès.'),
            onError: () => toast.error('Erreur lors de la suppression du but.')
          })} players={[...homePlayers, ...awayPlayers]} />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ajouter carton - {match.home_equipe?.nom}</h3>
            <form onSubmit={addCartonHome} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Joueur</label>
                <TomSingle
                  options={homePlayers.map(p => ({ value: p.id, label: p.nom }))}
                  value={cartonHome.joueur_id || ''}
                  onChange={(val) => setCartonHome({ ...cartonHome, joueur_id: val ? Number(val) : '' })}
                  placeholder="Rechercher un joueur..."
                  allowEmpty
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Type</label>
                <select value={cartonHome.type} onChange={(e) => setCartonHome({ ...cartonHome, type: e.target.value as 'jaune' | 'rouge' | '' })} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="">-</option>
                  <option value="jaune">Jaune</option>
                  <option value="rouge">Rouge</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
                <input type="number" min={0} max={130} value={cartonHome.minute as any} onChange={(e) => setCartonHome({ ...cartonHome, minute: e.target.value ? Number(e.target.value) : '' })} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <button type="submit" className="px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700">Ajouter carton</button>
            </form>
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cartons enregistrés</h4>
              <ul className="space-y-1">
                {match.cartons?.filter((c:any) => c.equipe_id === match.equipe_home_id || (!c.equipe_id && homePlayers.some(p => p.id === c.joueur_id))).map((c:any) => (
                  <li key={c.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                    <span className={`${c.type === 'rouge' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {playerName(c.joueur_id)} - {c.type} {c.minute != null ? `(${c.minute}')` : ''}
                    </span>
                    <button type="button" onClick={() => removeCarton(c.id)} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs">Supprimer</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ajouter carton - {match.away_equipe?.nom}</h3>
            <form onSubmit={addCartonAway} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Joueur</label>
                <TomSingle
                  options={awayPlayers.map(p => ({ value: p.id, label: p.nom }))}
                  value={cartonAway.joueur_id || ''}
                  onChange={(val) => setCartonAway({ ...cartonAway, joueur_id: val ? Number(val) : '' })}
                  placeholder="Rechercher un joueur..."
                  allowEmpty
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Type</label>
                <select value={cartonAway.type} onChange={(e) => setCartonAway({ ...cartonAway, type: e.target.value as 'jaune' | 'rouge' | '' })} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="">-</option>
                  <option value="jaune">Jaune</option>
                  <option value="rouge">Rouge</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
                <input type="number" min={0} max={130} value={cartonAway.minute as any} onChange={(e) => setCartonAway({ ...cartonAway, minute: e.target.value ? Number(e.target.value) : '' })} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <button type="submit" className="px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700">Ajouter carton</button>
            </form>
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cartons enregistrés</h4>
              <ul className="space-y-1">
                {match.cartons?.filter((c:any) => c.equipe_id === match.equipe_away_id || (!c.equipe_id && awayPlayers.some(p => p.id === c.joueur_id))).map((c:any) => (
                  <li key={c.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
                    <span className={`${c.type === 'rouge' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {playerName(c.joueur_id)} - {c.type} {c.minute != null ? `(${c.minute}')` : ''}
                    </span>
                    <button type="button" onClick={() => removeCarton(c.id)} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs">Supprimer</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function AddGoals({ title, teamId, matchId, players, opponentPlayers }: { title: string; teamId: number; matchId: number; players: {id:number; nom:string}[]; opponentPlayers: {id:number; nom:string}[] }) {
  const { delete: destroy } = useForm({});
  const [form, setForm] = React.useState<{ buteur_id: number | ''; passeur_id: number | ''; minute: string | ''; type: string }>({ buteur_id: '', passeur_id: '', minute: '', type: 'normal' });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buteur_id) return;
    router.post(`/dashboard/coupe-matchs/${matchId}/buts`, { equipe_id: teamId, buteur_id: form.buteur_id, passeur_id: form.passeur_id || null, minute: form.minute || null, type: form.type }, { 
      preserveScroll: true,
      onSuccess: () => {
        toast.success('But ajouté avec succès.');
        setForm({ buteur_id: '', passeur_id: '', minute: '', type: 'normal' });
      },
      onError: () => {
        toast.error('Erreur lors de l\'ajout du but.');
      }
    });
  };
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Buteur</label>
          <select
            value={form.buteur_id || ''}
            onChange={(e) => setForm({ ...form, buteur_id: e.target.value ? Number(e.target.value) : '' })}
            className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Rechercher un joueur...</option>
            {(form.type === 'csc' ? opponentPlayers : players).map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Passeur (optionnel)</label>
          <select
            value={form.passeur_id || ''}
            onChange={(e) => setForm({ ...form, passeur_id: e.target.value ? Number(e.target.value) : '' })}
            className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">—</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400">Minute</label>
          <input type="text" value={form.minute as any} onChange={(e)=> setForm({ ...form, minute: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="ex: 45, 45+2, 90+3" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400">Type de but</label>
          <select value={form.type} onChange={(e)=> {
            const newType = e.target.value;
            setForm({ 
              ...form, 
              type: newType, 
              // Ne vider le buteur que si on passe à CSC (car CSC = buteur adverse)
              buteur_id: newType === 'csc' ? '' : form.buteur_id
            });
          }} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="normal">Normal</option>
            <option value="coup_franc">Coup franc</option>
            <option value="penalty">Penalty</option>
            <option value="csc">CSC</option>
          </select>
        </div>
        <button type="submit" className="px-3 py-2 rounded text-white bg-green-600 hover:bg-green-700">Ajouter but</button>
      </form>
    </div>
  );
}

function GoalList({ title, goals, onRemove, players }: { title: string; goals: any[]; onRemove: (id:number)=>void; players: {id:number; nom:string}[] }) {
  const nameOf = (id:number)=> players.find(p=>p.id===id)?.nom || `#${id}`;
  const getTypeLabel = (type?: string) => {
    switch(type) {
      case 'coup_franc': return ' (CF)';
      case 'penalty': return ' (PEN)';
      case 'csc': return ' (CSC)';
      default: return '';
    }
  };
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <ul className="space-y-1">
        {goals?.map((g:any)=> (
          <li key={g.id} className="flex items-center justify-between text-sm text-gray-800 dark:text-gray-200">
            <span>{nameOf(g.buteur_id)}{g.minute!=null?` (${g.minute}')`:''}{g.passeur_id?`, passe: ${nameOf(g.passeur_id)}`:''}{getTypeLabel(g.type)}</span>
            <button type="button" onClick={()=>onRemove(g.id)} className="px-2 py-0.5 rounded bg-red-600 text-white text-xs">Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


