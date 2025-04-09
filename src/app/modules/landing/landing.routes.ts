import { GestionPuestosComponent } from './puestos/gestion-puestos/gestion-puestos.component';
import { PuestosComponent } from './puestos/puestos.component';
import { Routes } from '@angular/router';

export default [
    {
        path     : '',
        component: PuestosComponent,
    },
    {
        path     : 'puestos/:id',
        component: GestionPuestosComponent,
    },
] as Routes;
