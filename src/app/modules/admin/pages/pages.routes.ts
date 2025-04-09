import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsuariosComponent } from "./usuarios/usuarios.component";
import { CatalogoDetalleComponent } from "./maestras/catalogo-detalle/catalogo-detalle.component";
import { ListarFormularioComponent } from "./formulario/listar-formulario/listar-formulario.component";

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
        path: 'formulario/listar-formulario',
        component: ListarFormularioComponent
    },
    {
        path: 'formulario/listar-formulario/:Id',
        component: ListarFormularioComponent
    },
    {
        path: 'maestras/catalogo-detalle',
        component: CatalogoDetalleComponent
    }
] as Routes;
