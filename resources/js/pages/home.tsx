import { Head } from '@inertiajs/react';
import PublicHeader from '@/components/PublicHeader';
import logo from '../../images/logo.svg';
import homeBackground from '../../images/home-backgroud.avif';

export default function Home() {
    return (
        <div 
            className="min-h-screen text-gray-900 dark:text-white relative"
            style={{
                backgroundImage: `url(${homeBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
            
            <div className="relative z-10">
            <Head title="Accueil" />
            <PublicHeader />
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-8">
                        <img 
                            src={logo} 
                            alt="Sport Plus Dream League" 
                            className="h-48 w-96 sm:h-64 sm:w-[500px] object-contain"
                        />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
                        BIENVENUE DANS LA DREAM LEAGUE
                    </h1>
                </div>
                
                <div className="prose prose-lg max-w-none dark:prose-invert mx-auto bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-lg p-6 sm:p-8 md:p-10 shadow-2xl">
                    <p className="text-lg leading-relaxed mb-6 text-white dark:text-gray-100">
                        La Dream League est un championnat de football imaginaire où plein d'univers se rencontre tel que, le jeux vidéos et l'animation, mais aussi notre cher réalité que l'on connait bien.
                    </p>

                    <p className="text-lg leading-relaxed mb-6 text-white dark:text-gray-100">
                        A travers ce site, je vous propose de continuer l'expérience de ce championnat au-delà des lives du Dimanche et des vidéos disponibles sur la chaîne Youtube, et de découvrir des contenus exclusif tel que des interviews de joueurs, des dramas, et de mieux faire connaissance avec les équipes participantes ! Le but étant de créer une véritable expérience de ligue de football tel qu'on la connais aujourd'hui.
                    </p>

                    <p className="text-lg leading-relaxed mb-6 text-white dark:text-gray-100">
                        Le championnat a bien grandis et en 2 saisons, est passé de 14 participants a 20 avec l'arriver de nouveau clubs soumis par la communauté.
                    </p>

                    <p className="text-lg leading-relaxed mb-6 text-white dark:text-gray-100">
                        Le site sera régulièrement mis à jour donc n'hésitez pas à venir le checker aussi souvent que possible.
                    </p>

                    <p className="text-lg leading-relaxed mb-6 text-white dark:text-gray-100">
                        Je vous souhaite à présent une bonne visite de ce site ^^
                    </p>
                </div>
            </main>
            <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-300 dark:text-gray-400 text-center">
                © {new Date().getFullYear()} SPDL
            </footer>
            </div>
        </div>
    );
}


