import { Routes } from '@angular/router';
import { AuthResetPasswordComponent } from 'app/modules/auth/reset-password/reset-password.component';
import { ConfirmacionRestablecerComponent } from './confirmacion/confirmacion.component';

export default [
    {
        path: '',
        component: AuthResetPasswordComponent,
    },
    {
        path: 'confirmacion',
        component: ConfirmacionRestablecerComponent,
    },
] as Routes;
