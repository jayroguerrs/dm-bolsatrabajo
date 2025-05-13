import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route : ActivatedRouteSnapshot, state : RouterStateSnapshot) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    const allowedWithoutCheck = ['/admin/sign-out', '/admin/404-not-found']; // Agrega rutas que no deben ser validadas

    // Permitir acceso directo a rutas excluidas
    if (allowedWithoutCheck.some(path => state.url.startsWith(path))) {
        return of(true);
    }


    // Verificar estado de autenticación
    return authService.check().pipe(
        switchMap((authenticated) => {
            // Si no está autenticado, redirigir a login
            if (!authenticated) {
                const redirectURL = state.url === '/admin/sign-out' ? '' : `redirectURL=${encodeURIComponent(state.url)}`;
                return of(router.parseUrl(`/admin/sign-in?${redirectURL}`));
            }

            // Obtener y verificar permisos de ruta
            const menuPaths = localStorage.getItem('menuPaths')?.split(';') || [];
            const currentPath = normalizePath(state.url);

            // Verificar acceso usando comparación mejorada
            if (!hasRouteAccess(currentPath, menuPaths)) {
                console.warn(`Acceso denegado a: ${currentPath}. Rutas permitidas:`, menuPaths);
                return of(router.parseUrl('/admin/404-not-found'));
            }

            return of(true);
        })
    );
};

/**
 * Normaliza una ruta para comparación consistente
 */
function normalizePath(path: string): string {
    if (!path) return '';

    // Eliminar query params, fragmentos y slash final
    return path.split('?')[0]
              .split('#')[0]
              .replace(/\/+$/, '')
              .toLowerCase();
}

/**
 * Verifica si la ruta actual está permitida
 */
function hasRouteAccess(currentPath: string, allowedPaths: string[]): boolean {
    // Primera pasada: coincidencia exacta
    if (allowedPaths.some(path => normalizePath(path) === currentPath)) {
        return true;
    }

    // Segunda pasada: manejo de parámetros dinámicos (ej: 'formulario/editar/:id')
    return allowedPaths.some(allowedPath => {
        const normalizedAllowed = normalizePath(allowedPath);

        // Si la ruta permitida tiene parámetros
        if (normalizedAllowed.includes('/:')) {
            const allowedSegments = normalizedAllowed.split('/');
            const currentSegments = currentPath.split('/');

            // Deben tener el mismo número de segmentos
            if (allowedSegments.length !== currentSegments.length) {
                return false;
            }

            // Cada segmento debe coincidir o ser un parámetro
            return allowedSegments.every((segment, index) => {
                return segment.startsWith(':') || segment === currentSegments[index];
            });
        }

        // Tercera pasada: coincidencia parcial para rutas padre/hijo
        return currentPath.startsWith(normalizedAllowed + '/');
    });
}
