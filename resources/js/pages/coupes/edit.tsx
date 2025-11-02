import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import * as React from 'react';
import { TomSelectSingle as TomSingle } from '@/components/tomselect';

export default function CoupeEdit({ coupe, equipes }: { 
  coupe: any; 
  equipes: {id:number; nom:string; logo?:string}[];
}) {
  const { post, processing, put } = useForm({});
  const generate = (e: React.FormEvent)=>{ e.preventDefault(); post(`/coupes/${coupe.id}/generate`, { preserveScroll: true }); };
  const [selection, setSelection] = React.useState<number[]>(coupe.equipes?.map((e:any)=>e.id) || []);
  const toggleEquipe = (id: number) => {
    setSelection((prev)=> prev.includes(id) ? prev.filter(x=>x!==id) : (prev.length >= (coupe.nombre_equipes || 0) ? prev : [...prev, id]));
  };
  const saveSelection = () => {
    router.put(`/coupes/${coupe.id}`, { equipes: selection }, { preserveScroll: true });
  };
  const recalculer = () => {
    router.post(`/coupes/${coupe.id}/recalculer`, {}, { preserveScroll: true });
  };
  const [addSelection, setAddSelection] = React.useState<number | ''>('');
  const notSelectedOptions = React.useMemo(() => (
    equipes.filter(e => !selection.includes(e.id)).map(e => ({ value: e.id, label: e.nom }))
  ), [equipes, selection]);
  return (
    <AppLayout>
      <Head title={`Éditer ${coupe.nom}`} />
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{coupe.nom}</h1>
            {coupe.modele && (
              <div className="flex items-center space-x-2 mt-2">
                {coupe.modele.logo && (
                  <img 
                    src={coupe.modele.logo} 
                    alt={`Logo ${coupe.modele.nom}`}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Modèle: {coupe.modele.nom}
                </span>
              </div>
            )}
          </div>
          <Link href="/dashboard/coupes" className="px-3 py-2 rounded bg-gray-600 text-white">Retour</Link>
        </div>
        {!coupe.rounds?.length ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Équipes de la coupe</h2>
            <div className="text-xs text-gray-600 dark:text-gray-400">{selection.length}/{coupe.nombre_equipes || 0} sélectionnées</div>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Ajouter une équipe</label>
              <TomSingle options={notSelectedOptions} value={addSelection} onChange={(val)=> setAddSelection(val ? Number(val) : '')} allowEmpty placeholder="Rechercher/choisir une équipe à ajouter" />
            </div>
            <button type="button" onClick={()=> { if(addSelection){ toggleEquipe(Number(addSelection)); setAddSelection(''); } }} disabled={!addSelection || selection.length >= (coupe.nombre_equipes || 0)} className="inline-flex items-center px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">Ajouter</button>
            <button onClick={saveSelection} className="px-3 py-2 rounded bg-green-600 text-white">Enregistrer</button>
            <form onSubmit={generate}><button type="submit" disabled={processing || selection.length < 2} className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Générer l'arbre</button></form>
            <button onClick={recalculer} className="px-3 py-2 rounded bg-green-600 text-white ml-2">Recalculer vainqueurs</button>
          </div>
          <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium">Logo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selection.map((id)=> {
                  const e = equipes.find(eq => eq.id === id);
                  if(!e) return null;
                  return (
                    <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2">{ e.logo ? <img src={e.logo} className="h-8 w-8 rounded object-cover" /> : <span className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> }</td>
                      <td className="px-4 py-2 text-sm">{e.nom}</td>
                      <td className="px-4 py-2"><button type="button" onClick={()=> setSelection(prev=> prev.filter(x=> x!==id))} className="px-2.5 py-1.5 rounded text-white bg-red-600 hover:bg-red-700">Retirer</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        ) : null}
        {coupe.rounds?.length ? (
        <div className="space-y-6">
          {coupe.rounds.map((r:any)=> (
            <div key={r.id} className="">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{r.label || `Round ${r.numero}`}</h2>
              </div>
              <div className="overflow-hidden rounded border">
                <table className="min-w-full divide-y">
                  <tbody className="divide-y">
                    {r.matchs?.filter((m:any) => {
                      // Pour les séries de 3+ matchs, afficher tous les matchs
                      if (m.numero_match) return true;
                      // Pour les matchs aller-retour, afficher seulement les matchs aller
                      return m.is_aller;
                    }).map((m:any)=> (
                      <React.Fragment key={m.id}>
                        <tr>
                          <td className="px-3 py-2 font-semibold" colSpan={3}>
                            {m.numero_match ? `Match ${m.numero_match}` : 'Match aller'}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">
                            {m.home_equipe?.nom ?? (m.equipe_home_id ? `Équipe ${m.equipe_home_id}` : '-')}
                          </td>
                          <td className="px-3 py-2 text-center w-64">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-gray-800 dark:text-gray-200">
                                {m.termine ? `${m.score_home} - ${m.score_away}` : '-'}
                              </span>
                              {m.termine ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Terminé</span>
                              ) : null}
                              <Link href={`/coupe-matchs/${m.id}/edit`} className="px-2 py-1 rounded bg-blue-600 text-white">Modifier</Link>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {m.away_equipe?.nom ?? (m.equipe_away_id ? `Équipe ${m.equipe_away_id}` : '-')}
                          </td>
                        </tr>
                        {m.match_retour && !m.numero_match && (
                          <>
                            <tr>
                              <td className="px-3 py-2 font-semibold" colSpan={3}>
                                Match retour
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">
                                {m.match_retour.home_equipe?.nom ?? (m.match_retour.equipe_home_id ? `Équipe ${m.match_retour.equipe_home_id}` : '-')}
                              </td>
                              <td className="px-3 py-2 text-center w-64">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-sm text-gray-800 dark:text-gray-200">
                                    {m.match_retour.termine ? `${m.match_retour.score_home} - ${m.match_retour.score_away}` : '-'}
                                  </span>
                                  {m.match_retour.termine ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Terminé</span>
                                  ) : null}
                                  <Link href={`/coupe-matchs/${m.match_retour.id}/edit`} className="px-2 py-1 rounded bg-blue-600 text-white">Modifier</Link>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right">
                                {m.match_retour.away_equipe?.nom ?? (m.match_retour.equipe_away_id ? `Équipe ${m.match_retour.equipe_away_id}` : '-')}
                              </td>
                            </tr>
                            {(m.termine && m.match_retour.termine) && (
                              <tr className="bg-gray-50 dark:bg-gray-800">
                                <td className="px-3 py-2 font-bold" colSpan={3}>
                                  Score cumulé: {m.score_cumule_home} - {m.score_cumule_away}
                                  {(m.match_retour?.tirs_au_but_home !== null && m.match_retour?.tirs_au_but_away !== null) && (
                                    <span className="ml-2 text-sm">(TAB retour: {m.match_retour.tirs_au_but_home} - {m.match_retour.tirs_au_but_away})</span>
                                  )}
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        ) : null}
      </div>
    </AppLayout>
  );
}


