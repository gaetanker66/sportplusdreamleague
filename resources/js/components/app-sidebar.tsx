import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Trophy, Users2, Briefcase, Palette, Crown, Settings, ArrowRightLeft } from 'lucide-react';
import AppLogo from './app-logo';

const allMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Ligues',
        href: '/dashboard/ligues',
        icon: Trophy,
    },
    {
        title: 'Saisons',
        href: '/dashboard/saisons',
        icon: BookOpen,
    },
    {
        title: 'Équipes',
        href: '/dashboard/equipes',
        icon: Users2,
    },
    {
        title: 'Postes',
        href: '/dashboard/postes',
        icon: Briefcase,
    },
    {
        title: 'Transferts',
        href: '/dashboard/transferts',
        icon: ArrowRightLeft,
    },
    {
        title: 'Coupes',
        href: '/dashboard/coupes',
        icon: Trophy,
    },
    {
        title: 'Coupes avec Poules',
        href: '/dashboard/coupes-avec-poules',
        icon: Crown,
    },
    {
        title: 'Modèles de Coupe',
        href: '/dashboard/coupe-modeles',
        icon: Palette,
    },
    {
        title: 'Modèles Coupes Poules',
        href: '/dashboard/coupe-avec-poule-modeles',
        icon: Palette,
    },
    {
        title: 'Administration',
        href: '/dashboard/admin/users',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.isAdmin ?? false;
    
    // Filtrer les items de navigation pour ne montrer l'administration que si l'utilisateur est admin
    const mainNavItems = allMainNavItems.filter(item => {
        if (item.href === '/admin/users') {
            return isAdmin;
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
