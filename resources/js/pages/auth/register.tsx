import { login } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';

import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

// Page d'enregistrement désactivée - seuls les admins peuvent créer des comptes
export default function Register() {
    useEffect(() => {
        // Rediriger vers la page de connexion si quelqu'un essaie d'accéder à cette page
        router.visit(login());
    }, []);

    return (
        <AuthLayout
            title="Création de compte désactivée"
            description="L'enregistrement public n'est pas disponible"
        >
            <Head title="Register" />
            <div className="text-center">
                <p className="text-muted-foreground mb-4">
                    La création de compte n'est pas disponible publiquement.
                </p>
                <p className="text-sm text-muted-foreground">
                    Veuillez{' '}
                    <TextLink href={login()}>
                        vous connecter
                    </TextLink>
                    {' '}ou contactez un administrateur.
                </p>
            </div>
        </AuthLayout>
    );
}
