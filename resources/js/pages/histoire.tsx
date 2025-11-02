import { Head } from '@inertiajs/react';
import * as React from 'react';
import PublicHeader from '@/components/PublicHeader';
import histoireBackground from '../../images/equipe-background.avif';

interface Etape {
    id: number;
    titre: string;
    date_label?: string | null;
    date?: string | null;
    description?: string | null;
    image?: string | null;
    ordre: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    etapes: Etape[];
}

export default function Histoire({ etapes = [] }: Props) {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % etapes.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + etapes.length) % etapes.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    React.useEffect(() => {
        if (etapes.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % etapes.length);
        }, 10000); // Change de slide toutes les 10 secondes

        return () => clearInterval(timer);
    }, [etapes.length]);

    if (etapes.length === 0) {
        return (
            <div 
                className="min-h-screen text-gray-900 dark:text-white relative"
                style={{
                    backgroundImage: `url(${histoireBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
                
                <div className="relative z-10">
                    <Head title="Histoire" />
                    <PublicHeader />
                    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                        <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Histoire</h1>
                        <p className="text-white drop-shadow-md">Aucune étape disponible pour le moment.</p>
                    </main>
                </div>
            </div>
        );
    }

    const currentEtape = etapes[currentIndex];

    return (
        <div 
            className="min-h-screen text-gray-900 dark:text-white relative"
            style={{
                backgroundImage: `url(${histoireBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
            
            <div className="relative z-10">
                <Head title="Histoire" />
                <PublicHeader />
                <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                            C'est ici que l'Histoire s'écrit...
                        </h1>
                        <p className="text-white/90 drop-shadow-md text-lg">
                            Au cours de son histoire la Dream League a vu des étoiles apparaître au-dessus des armoiries de différents clubs.
                        </p>
                    </div>

                    {/* Slider Container */}
                    <div className="relative bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden mb-6">
                        {/* Slide Content */}
                        <div className="relative">
                            {/* Navigation Buttons */}
                            {etapes.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                                        aria-label="Étape précédente"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                                        aria-label="Étape suivante"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Slide Content */}
                            <div className="p-8">
                                {/* Date Label */}
                                {currentEtape.date_label && (
                                    <div className="mb-4">
                                        <span className="inline-block px-4 py-2 bg-blue-600/80 dark:bg-blue-700/80 text-white rounded-full text-sm font-semibold backdrop-blur-sm">
                                            {currentEtape.date_label}
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
                                    {currentEtape.titre}
                                </h2>

                                {/* Image */}
                                {currentEtape.image && (
                                    <div className="mb-6 rounded-lg overflow-hidden">
                                        <img
                                            src={currentEtape.image}
                                            alt={currentEtape.titre}
                                            className="w-full h-auto max-h-96 object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Description */}
                                {currentEtape.description && (
                                    <div className="text-white/90 drop-shadow-md prose prose-invert max-w-none">
                                        <p className="whitespace-pre-line text-lg leading-relaxed">
                                            {currentEtape.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Slide Indicators */}
                        {etapes.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {etapes.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentIndex
                                                ? 'bg-blue-600 w-8'
                                                : 'bg-white/40 w-2 hover:bg-white/60'
                                        }`}
                                        aria-label={`Aller à l'étape ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Slide Counter */}
                        {etapes.length > 1 && (
                            <div className="absolute top-4 right-4 bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                                {currentIndex + 1} / {etapes.length}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

