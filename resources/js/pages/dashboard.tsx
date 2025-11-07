import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { 
    Trophy, 
    BookOpen, 
    Users2, 
    Briefcase, 
    ArrowRightLeft, 
    Crown, 
    Palette, 
    Settings,
    Calendar,
    BarChart3
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardCard {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    emoji: string;
    color: string;
}

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.isAdmin ?? false;

    const dashboardCards: DashboardCard[] = [
        {
            title: 'Ligues',
            description: 'Créez et gérez vos ligues',
            href: '/dashboard/ligues',
            icon: Trophy,
            emoji: '🏆',
            color: 'bg-blue-500',
        },
        {
            title: 'Saisons',
            description: 'Gérez les saisons de vos ligues',
            href: '/dashboard/saisons',
            icon: Calendar,
            emoji: '📅',
            color: 'bg-green-500',
        },
        {
            title: 'Équipes',
            description: 'Gérez vos équipes et joueurs',
            href: '/dashboard/equipes',
            icon: Users2,
            emoji: '⚽',
            color: 'bg-purple-500',
        },
        {
            title: 'Postes',
            description: 'Gérez les postes des joueurs',
            href: '/dashboard/postes',
            icon: Briefcase,
            emoji: '👔',
            color: 'bg-orange-500',
        },
        {
            title: 'Transferts',
            description: 'Gérez les transferts de joueurs',
            href: '/dashboard/transferts',
            icon: ArrowRightLeft,
            emoji: '🔄',
            color: 'bg-pink-500',
        },
        {
            title: 'Coupes',
            description: 'Gérez vos coupes et tournois',
            href: '/dashboard/coupes',
            icon: Trophy,
            emoji: '🏆',
            color: 'bg-yellow-500',
        },
        {
            title: 'Coupes avec Poules',
            description: 'Gérez les coupes avec phase de poules',
            href: '/dashboard/coupes-avec-poules',
            icon: Crown,
            emoji: '👑',
            color: 'bg-indigo-500',
        },
        {
            title: 'Modèles de Coupe',
            description: 'Gérez les modèles de coupe',
            href: '/dashboard/coupe-modeles',
            icon: Palette,
            emoji: '🎨',
            color: 'bg-teal-500',
        },
        {
            title: 'Modèles Coupes Poules',
            description: 'Gérez les modèles de coupes avec poules',
            href: '/dashboard/coupe-avec-poule-modeles',
            icon: Palette,
            emoji: '🎨',
            color: 'bg-cyan-500',
        },
    ];

    if (isAdmin) {
        dashboardCards.push({
            title: 'Administration',
            description: 'Gérez les utilisateurs',
            href: '/dashboard/admin/users',
            icon: Settings,
            emoji: '⚙️',
            color: 'bg-red-500',
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sport Plus Dream League</h1>
                    <p className="text-gray-600 dark:text-gray-400">Gérez votre ligue de sport de rêve</p>
                </div>
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {dashboardCards.map((card) => {
                        const IconComponent = card.icon;
                        return (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="group relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 p-6 flex flex-col justify-between hover:shadow-lg hover:scale-105"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${card.color} p-3 rounded-lg text-white`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">
                                        {card.emoji}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {card.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                
                <div className="relative min-h-[200px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border bg-white dark:bg-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <Link 
                            href="/dashboard/ligues/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                        >
                            <div className="text-2xl mr-3">➕</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouvelle Ligue</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle ligue</div>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/dashboard/saisons/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                        >
                            <div className="text-2xl mr-3">📅</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouvelle Saison</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle saison</div>
                            </div>
                        </Link>

                        <Link 
                            href="/dashboard/equipes/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                        >
                            <div className="text-2xl mr-3">⚽</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouvelle Équipe</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle équipe</div>
                            </div>
                        </Link>

                        <Link 
                            href="/dashboard/postes/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                        >
                            <div className="text-2xl mr-3">👔</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouveau Poste</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Créer un nouveau poste</div>
                            </div>
                        </Link>

                        <Link 
                            href="/dashboard/transferts/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                        >
                            <div className="text-2xl mr-3">🔄</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouveau Transfert</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Enregistrer un transfert</div>
                            </div>
                        </Link>

                        <Link 
                            href="/dashboard/coupes/create" 
                            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:shadow-md"
                        >
                            <div className="text-2xl mr-3">🏆</div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">Nouvelle Coupe</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Créer une nouvelle coupe</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
