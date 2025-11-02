import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CoupesIndex({ coupes }: { coupes: any[] }) {
  const { delete: destroy } = useForm({});

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ? Cette action est irréversible.')) {
      destroy(`/coupes/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Coupes" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Coupes</h1>
          <Link href="/coupes/create" className="px-3 py-2 rounded bg-indigo-600 text-white">Nouvelle coupe</Link>
        </div>
        <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold">Nom</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Modèle</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Équipes</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(coupes||[]).map((c:any)=> (
                <tr key={c.id}>
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      {c.modele?.logo && (
                        <img 
                          src={c.modele.logo} 
                          alt={`Logo ${c.modele.nom}`}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{c.nom}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {c.modele ? (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{c.modele.nom}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Aucun modèle</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm">{c.equipes?.length || 0}/{c.nombre_equipes || 0}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/coupes/${c.id}/edit`} className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Éditer</Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
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


