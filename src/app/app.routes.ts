import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: ''},
    {path: 'admin', pathMatch : 'full', redirectTo: 'admin/dashboard'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'admin/dashboard'},

    // Auth routes for guests
    {
        path: 'admin',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        data: {
            layout: 'empty'
        },
        children: [
            {path: '', loadChildren: () => import('app/modules/landing/landing.routes')},
            {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/apps/error/error-404/error-404.routes')},
        ]
    },

    // Admin routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: '', children: [
                // Consolidado
                {path: '', loadChildren: () => import('app/modules/admin/pages/pages.routes')},
                // 404 & Catch all
                {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/apps/error/error-404/error-404.routes')},
            ]}
        ]
    },

    // Apps routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'apps', children: [

                {path: 'profile', loadChildren: () => import('app/modules/admin/apps/profile/profile.routes')},
                {path: 'settings', loadChildren: () => import('app/modules/admin/apps/settings/settings.routes')},
                // Error
                {path: 'error', children: [
                    {path: '404', loadChildren: () => import('app/modules/admin/apps/error/error-404/error-404.routes')},
                    {path: '500', loadChildren: () => import('app/modules/admin/apps/error/error-500/error-500.routes')}
                ]},
            ]},
        ]
    },

    {path: '**', redirectTo: '404-not-found'},
];
