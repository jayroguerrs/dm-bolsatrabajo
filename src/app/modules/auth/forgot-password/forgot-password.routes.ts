import { Routes } from '@angular/router';
import { AuthForgotPasswordComponent } from 'app/modules/auth/forgot-password/forgot-password.component';
import { ConfirmacionOlvideComponent } from './confirmacion/confirmacion.component';

export default [
    {
        path: '',
        component: AuthForgotPasswordComponent,
    },
    {
        path: 'confirmacion',
        component: ConfirmacionOlvideComponent,
    }
] as Routes;
