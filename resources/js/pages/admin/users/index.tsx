import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Helper function pour générer les routes
const route = (name: string, ...params: (string | number)[]): string => {
    const routes: Record<string, string | ((id: number) => string)> = {
        'admin.users.index': '/dashboard/admin/users',
        'admin.users.create': '/dashboard/admin/users/create',
        'admin.users.edit': (id: number) => `/dashboard/admin/users/${id}/edit`,
        'admin.users.destroy': (id: number) => `/dashboard/admin/users/${id}`,
    };
    
    const routePattern = routes[name];
    if (typeof routePattern === 'function' && params.length > 0) {
        return routePattern(params[0] as number);
    }
    return (typeof routePattern === 'string' ? routePattern : `/dashboard/${name.replace('.', '/')}`) as string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Administration', href: '/dashboard/admin/users' },
    { title: 'Utilisateurs', href: '/dashboard/admin/users' },
];

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface UsersIndexProps {
    users?: {
        data: User[];
        links: any[];
        meta: {
            total: number;
            current_page: number;
            last_page: number;
        };
    };
}

export default function UsersIndex({ users }: UsersIndexProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            setDeletingId(id);
            router.delete(route('admin.users.destroy', id), {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    // Valeurs par défaut si users n'est pas défini
    const usersData = users?.data || [];
    const usersMeta = users?.meta || { total: 0, current_page: 1, last_page: 1 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Utilisateurs" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
                        <p className="text-muted-foreground">
                            Créez et gérez les comptes utilisateurs de votre application
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.users.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvel Utilisateur
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Liste des Utilisateurs
                        </CardTitle>
                        <CardDescription>
                            {usersMeta.total} utilisateur{usersMeta.total > 1 ? 's' : ''} au total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {usersData.length > 0 ? (
                                usersData.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{user.name}</h3>
                                            {user.id === 1 && (
                                                <Badge variant="default">Admin</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('admin.users.edit', user.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        {user.id !== 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deletingId === user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Aucun utilisateur trouvé.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </AppLayout>
    );
}
