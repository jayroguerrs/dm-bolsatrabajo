import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route : ActivatedRouteSnapshot, state : RouterStateSnapshot) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    const allowedWithoutCheck = ['/admin/sign-out', '/admin/404-not-found']; // Agrega rutas que no deben ser validadas

    // Si la ruta actual está en la lista de rutas permitidas sin validación, permite el acceso
    if (allowedWithoutCheck.includes(state.url)) {
        return of(true);
    }


    // Check the authentication status
    return inject(AuthService)
        .check()
        .pipe(
            switchMap((authenticated) => {
                // If the user is not authenticated...
                if (!authenticated) {
                    // Redirect to the sign-in page with a redirectUrl param
                    const redirectURL =
                        state.url === 'admin/sign-out'
                            ? ''
                            : `redirectURL=${state.url}`;
                    const urlTree = router.parseUrl(`admin/sign-in?${redirectURL}`);
                    return of(urlTree);
                }

                // Verifica si el rol del usuario tiene acceso a la ruta actual
                const menuPaths = localStorage.getItem('menuPaths')?.split(';') || [];

                if (!menuPaths.includes(state.url)) {
                    return of(router.parseUrl('admin/404-not-found')); // Ruta de acceso denegado
                }

                return of(true);

            })
        );

};
