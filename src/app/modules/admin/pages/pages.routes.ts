import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsuariosComponent } from "./usuarios/usuarios.component";
import { CatalogoDetalleComponent } from "./maestras/catalogo-detalle/catalogo-detalle.component";
import { ConvocatoriasComponent } from "./bolsa/convocatorias/convocatorias.component";

export default [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'usuarios',
        component: UsuariosComponent
    },
    {
        path: 'bolsa/convocatorias',
        component: ConvocatoriasComponent
    },
    {
        path: 'maestras/catalogo-detalle',
        component: CatalogoDetalleComponent
    }
] as Routes;
