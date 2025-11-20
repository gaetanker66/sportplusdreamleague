import PublicHeader from '@/components/PublicHeader';
import { Head } from '@inertiajs/react';

type Equipe = {
    id: number;
    nom: string;
    logo?: string;
};

type Joueur = {
    id: number;
    nom: string;
};

type Actualite = {
    id: number;
    type: 'rumeur' | 'transfert';
    contenu: string;
    date: string;
    created_at: string;
    equipes: Equipe[];
    joueurs: Joueur[];
};

interface Props {
    actualites: Actualite[];
}

const typeLabels: Record<Actualite['type'], { label: string; color: string }> = {
    rumeur: { label: 'Rumeur', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' },
    transfert: { label: 'Transfert', color: 'bg-green-500/20 text-green-200 border border-green-500/40' },
};

export default function ActualitesMercato({ actualites }: Props) {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="min-h-screen bg-[#0b141a] text-white">
            <Head title="Actualités Mercato" />
            <PublicHeader />

            <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold">Actualités Mercato</h1>
                    <p className="text-white/70">
                        Toutes les rumeurs et officialisations du mercato
                    </p>
                </div>

                <section className="space-y-4">
                    {actualites.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
                            Aucune actualité mercato pour l&apos;instant.
                        </div>
                    )}

                    {actualites.map((actualite, index) => {
                        const typeMeta = typeLabels[actualite.type];
                        const formattedDate = formatter.format(new Date(actualite.date ?? actualite.created_at));
                        const isLast = index === actualites.length - 1;

                        return (
                            <article
                                key={actualite.id}
                                className="relative flex gap-4 rounded-2xl border border-white/8 bg-[#111c24] p-5 shadow-lg"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-semibold">
                                        {actualite.type === 'transfert' ? 'T' : 'R'}
                                    </div>
                                    {!isLast && <div className="mt-2 h-full w-0.5 bg-white/10" />}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${typeMeta.color}`}>
                                            {typeMeta.label}
                                        </span>
                                        <span className="text-xs text-white/60">{formattedDate}</span>
                                    </div>

                                    <div
                                        className="rich-content text-white/90"
                                        dangerouslySetInnerHTML={{ __html: actualite.contenu }}
                                    />

                                    {(actualite.equipes.length > 0 || actualite.joueurs.length > 0) && (
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {actualite.equipes.map((equipe) => (
                                                <span
                                                    key={`eq-${actualite.id}-${equipe.id}`}
                                                    className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-white/80"
                                                >
                                                    {equipe.nom}
                                                </span>
                                            ))}
                                            {actualite.joueurs.map((joueur) => (
                                                <span
                                                    key={`jo-${actualite.id}-${joueur.id}`}
                                                    className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-white/60"
                                                >
                                                    {joueur.nom}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>
            </main>
            <style>{`
                .rich-content {
                    white-space: pre-wrap;
                }
                .rich-content h1 {
                    font-size: 2.5rem;
                    line-height: 1.2;
                    font-weight: 800;
                    margin: 1rem 0 0.75rem;
                }
                .rich-content h2 {
                    font-size: 2rem;
                    line-height: 1.25;
                    font-weight: 700;
                    margin: 0.85rem 0 0.65rem;
                }
                .rich-content h3 {
                    font-size: 1.5rem;
                    line-height: 1.3;
                    font-weight: 600;
                    margin: 0.75rem 0 0.5rem;
                }
                .rich-content p {
                    margin: 0.75rem 0;
                }
                .rich-content ul,
                .rich-content ol {
                    padding-left: 1.5rem;
                    margin: 0.5rem 0 0.5rem 0;
                }
                .rich-content a {
                    color: #93c5fd;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}

