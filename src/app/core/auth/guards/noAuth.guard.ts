import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (
    route,
    state
) => {
    const router: Router = inject(Router);

    const allowedWithoutCheck = [
        '/admin/reset-password',
    ];

    // Permitir acceso directo a rutas excluidas
    if (allowedWithoutCheck.some(path => state.url.startsWith(path))) {
        return of(true);
    }

    // Check the authentication status
    return inject(AuthService)
        .check()
        .pipe(
            switchMap((authenticated) => {
                // If the user is authenticated...
                if (authenticated) {
                    return of(router.parseUrl('/admin'));
                }

                // Allow the access
                return of(true);
            })
        );
};
