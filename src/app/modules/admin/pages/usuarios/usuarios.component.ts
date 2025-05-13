import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { BehaviorSubject, Observable, catchError, finalize, merge, of, tap } from 'rxjs';
import { MensajesService } from 'app/core/services/messages.service';
import { IRolCombo, IRolFiltroCombo } from 'app/core/interfaces/iRol';
import { CatalogoDetalleService } from 'app/core/services/catalogodetalle.service';
import { ICatalogoDetalle } from 'app/core/interfaces/iCatalogoDetalle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatSelectModule } from '@angular/material/select';
import { MyCustomPaginatorIntl } from 'app/getPaginatorIntl';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { UsuarioService } from 'app/core/services/usuario.service';
import { IUsuario, IUsuarioFiltro, IUsuarioFiltroPaginado } from 'app/core/interfaces/iUsuario';
import { OnlyLetterDirective } from 'app/core/directives/onlyLetter.directive';
import { RolService } from 'app/core/services/rol.service';
import { GestionUsuarioComponent } from './gestion-usuario/gestion-usuario.component';
import { GestionRolesComponent } from './gestion-roles/gestion-roles.component';
import { StatusResponse } from 'app/core/services/StatusResponse.model';
import * as FileSaver from 'file-saver';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector        : 'usuarios',
    templateUrl     : './usuarios.component.html',
    styleUrls       : ['./usuarios.component.scss'],
    encapsulation   : ViewEncapsulation.None,
    standalone: true,
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' }, },
        { provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl },
        { provide: DatePipe }
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatChipsModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatMenuModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatTableModule,
        MatTooltipModule,
        MatSortModule,
        OnlyLetterDirective
    ],

})
export class UsuariosComponent implements OnInit, AfterViewInit {
    columnasTabla: string[] = ['acciones', 'nombre', 'rol', 'estado', 'fechaCreacion', 'responsable' ];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    filtro: IUsuarioFiltroPaginado;
    lstEstado: ICatalogoDetalle[] = [];
    lstSexo: ICatalogoDetalle[] = [];
    lstRol: IRolCombo[] = [];
    lstCatalogoDetalle: ICatalogoDetalle[] = [];
    frmUsuario: UntypedFormGroup;

    constructor(
        private usuarioService: UsuarioService,
        private authService: AuthService,
        private catalogoDetalleService: CatalogoDetalleService,
        private rolService: RolService,
        private mensajesService: MensajesService,
        private _formBuilder: UntypedFormBuilder,
        private _matDialog: MatDialog,
    )
    {}

    ngOnInit(): void {
        this.frmUsuario = this._formBuilder.group({
            usuario: [''],
            estado: [''],
            sexo: [-1],
            rol : [-1]
        });

        this.listarGenero();
        this.listarEstado();
        this.listarRol();
        this.inicializarDataGrid();
    }

    ngAfterViewInit(): void {
        merge(this.sort.sortChange)
        .pipe(tap(() => this.cargarOrdenamiento()))
        .subscribe();

        merge(this.paginator.page)
            .pipe(tap(() => this.cargarPaginado()))
            .subscribe();
    }

    abrirModalUsuario(vId?: number, frmDisabled?: boolean) {
        let textoTitulo: string = "";
        let nNuevo: boolean = false;

        if (vId == 0 || vId == null || vId == undefined) {
            textoTitulo = "Registrar Usuario";
            nNuevo = true;
        } else {
            textoTitulo = "Modificar Usuario";
        }

        if (frmDisabled) {
            textoTitulo = "Visualizar Usuario";
        }

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "60%";
        dialogConfig.minWidth = "360px";
        dialogConfig.data = {
            titulo: textoTitulo,
            nNuevo: nNuevo,
            frmDisabled: frmDisabled,
            Id: vId,
        };

        const dialogRef = this._matDialog.open(GestionUsuarioComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            (data) => {
                if (data?.success) {
                    this.filtro.SortColumn = "fechaCreacion";
                    this.filtro.SortOrder = "desc";
                    this.dataSource.listar(this.filtro);
                    if (nNuevo) {
                        this.mensajesService.msgSuccess('Datos guardados correctamente', 'aewfawe');
                    } else {
                        this.mensajesService.msgSuccessMixin('Datos actualizados correctamente', "");
                    }
                }
            }
        );
    }

    asociar(vId?: number, vNombres?: string) {
        let textoTitulo: string = "Asociar Rol";

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "50%";
        dialogConfig.minWidth = "360px";
        dialogConfig.data = {
            titulo: textoTitulo,
            Id: vId,
            Nombres : vNombres
        };

        const dialogRef = this._matDialog.open(GestionRolesComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            (data) => {
                if (data?.success) {
                    this.filtro.SortColumn = "fechaCreacion";
                    this.filtro.SortOrder = "desc";
                    this.dataSource.listar(this.filtro);
                    this.mensajesService.msgSuccessMixin('Datos actualizados correctamente', "");
                }
            }
        );
    }

    inicializarDataGrid() {
        this.paginator.firstPage();
        this.filtro = {
            NumeroPagina: 1,
            TamanioPagina: 10,
            SortOrder: "",
            SortColumn: "",
            Usuario: "",
            Sexo: -1,
            RolId: -1,
            TipoRolId: -1,
            Estado: -1
        }
        this.dataSource = new GrillaPaginado(this.usuarioService, this.mensajesService);
        this.dataSource.listar(this.filtro);
    }

    cargarPaginado() {

        this.filtro = {
            NumeroPagina: this.paginator.pageIndex + 1,
            TamanioPagina: this.paginator.pageSize,
            SortOrder: this.sort.direction,
            SortColumn: this.sort.active,
            Usuario: this.filtro.Usuario,
            Sexo: this.filtro.Sexo,
            RolId: this.filtro.RolId,
            TipoRolId: this.filtro.TipoRolId,
            Estado: this.filtro.Estado
        }
        this.dataSource.listar(this.filtro);
    }

    cargarOrdenamiento() {

        this.filtro.SortOrder = this.sort.direction;
        this.filtro.SortColumn = this.sort.active;
        this.dataSource.listar(this.filtro);
    }

    listarGenero() {
        this.catalogoDetalleService.listarGenero()
            .subscribe((response) => {
                if (response.success) {
                    let lstSexo = [];
                    let iTodos = {
                        Id: -1,
                        Codigo: "",
                        Nombre: "-- TODOS --"
                    } as ICatalogoDetalle;
                    lstSexo.push(iTodos);

                    response.data.forEach(function (item) {
                        lstSexo.push(item);
                    })
                    this.lstSexo = lstSexo;
                }
                else {
                    this.lstSexo = [];
                }
                this.mensajesService.msgAutoClose();
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudieron cargar los registros");
                this.mensajesService.msgAutoClose();
            });
    }

    listarEstado() {
        this.catalogoDetalleService.listarEstado()
            .subscribe((response) => {
                if (response.success) {
                    let lstEstado = [];
                    let iTodos = {
                        Id: -1,
                        Codigo: "",
                        Nombre: "-- TODOS --"
                    } as ICatalogoDetalle;
                    lstEstado.push(iTodos);

                    response.data.forEach(function (item) {
                        lstEstado.push(item);
                    })
                    this.lstEstado = lstEstado;
                }
                else {
                    this.lstEstado = [];
                }
                this.mensajesService.msgAutoClose();
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudieron cargar los registros");
                this.mensajesService.msgAutoClose();
            });
    }

    listarRol() {
        let filtro = {
            IdTipoRol: 1
        } as IRolFiltroCombo;
        this.rolService.listarCmb(filtro)
            .subscribe((response) => {
                if (response.success) {
                    let lstRol = [];
                    let iTodos = {
                        Id: -1,
                        Nombre: "-- TODOS --"
                    } as IRolCombo;
                    lstRol.push(iTodos);

                    response.data.forEach(function (item) {
                        lstRol.push(item);
                    })
                    this.lstRol = lstRol;
                }
                else {
                    this.lstRol = [];
                }
                this.mensajesService.msgAutoClose();
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudieron cargar los registros");
                this.mensajesService.msgAutoClose();
            });
    }

    notificar(email : string) : void{

        if (email != undefined && email != '' ) {

            this.mensajesService.msgConfirm("¿Está seguro de enviar por correo electrónico el link para que el usuario seleccionado genere su contraseña?", () => {
                this.mensajesService.msgLoad("Procesando...");

                this.authService.forgotPassword(email).subscribe((respuesta: StatusResponse<boolean>) => {
                    if (respuesta.success) {
                        this.mensajesService.msgSuccessMixin('Se envió el link para generar contraseña a la dirección de correo electrónico del usuario seleccionado.', "");
                    }
                    else {
                        if (respuesta.validations.length > 0) {
                            let vMensajes = "";
                            respuesta.validations.forEach(
                                function (item) {
                                    vMensajes = item.message + "<br />";
                                }
                            )
                            this.mensajesService.msgError(vMensajes);
                        } else {
                            this.mensajesService.msgError("Ha ocurrido un error al intentar enviar el link para generar contraseña.");
                        }
                    }
                },
                (error: any) => {
                        this.mensajesService.msgError("Sucedió un Error");
                })
            },null);

        }

    }

    listarResumen() {

        this.paginator.firstPage();
        this.filtro.Estado = this.Estado.value;
        this.filtro.Usuario = this.Usuario.value;
        this.filtro.Sexo = this.Sexo.value;
        this.filtro.RolId = this.RolId.value;

        this.dataSource.listar(this.filtro);
    };

    limpiar() {
        this.Estado.setValue("");
        this.Sexo.setValue(-1);
        this.RolId.setValue(-1);
        this.Usuario.setValue("");
        this.paginator.pageSize = this.filtro.TamanioPagina;
        this.listarResumen();
    }

    eliminar(vId?: number) {
        if (vId != undefined && vId > 0) {
            this.mensajesService.msgConfirm("¿Está seguro de eliminar el registro?", () => {
                this.mensajesService.msgLoad("Procesando...");
                this.usuarioService.eliminar({ Id: vId }).subscribe((respuesta: { success: boolean; }) => {
                    if (respuesta.success) {
                        this.listarResumen();
                        this.mensajesService.msgSuccessMixin('Eliminado Correctamente', "");
                    }
                    else {
                        this.mensajesService.msgError("No se pudo eliminar");
                    }
                },
                    (error: any) => {
                        this.mensajesService.msgError("No se pudo eliminar");
                    })
            });
        }
    }

    ReporteExcel() {
        if (this.dataSource.totalItems === 0) {
            this.mensajesService.msgExportarVacio;
        } else {
            this.mensajesService.msgLoad("Descargando...");
            let filtroReporte = {
                Usuario: this.filtro.Usuario,
                Sexo: this.filtro.Sexo,
                RolId: this.filtro.RolId,
                TipoRolId: this.filtro.TipoRolId,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as IUsuarioFiltro;

            //1: Excel, 2: PDF
            this.usuarioService.generarReporte(filtroReporte, 1).subscribe({
                next: (respuesta: any) => {
                    ;
                    if (respuesta != null) {
                        const blob = new Blob([respuesta], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const vNombre = "ListaUsuarios_" + (new Date).toLocaleDateString() + ".xlsx";
                        FileSaver.saveAs(blob, vNombre);
                        this.mensajesService.msgSuccessMixin("Reporte de usuarios", "Descargado correctamente")
                    } else {
                        this.mensajesService.msgError("Error al descargar el archivo");
                    }
                },
                error: (error: any) => {
                    this.mensajesService.msgError("Error al descargar el archivo: " + error);
                }
            });
        }
    }

    ReportePDF() {
        if (this.dataSource.totalItems === 0) {
            this.mensajesService.msgExportarVacio;
        } else {
            this.mensajesService.msgLoad("Descargando...");
            let filtroReporte = {
                Usuario: this.filtro.Usuario,
                Sexo: this.filtro.Sexo,
                RolId: this.filtro.RolId,
                TipoRolId: this.filtro.TipoRolId,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as IUsuarioFiltro;

            //1: Excel, 2: PDF
            this.usuarioService.generarReporte(filtroReporte, 2).subscribe({
                next: (respuesta: any) => {
                    ;
                    if (respuesta != null) {
                        const blob = new Blob([respuesta], { type: 'application/pdf' });
                        const vNombre = "ListaUsuarios_" + (new Date).toLocaleDateString() + ".pdf";
                        FileSaver.saveAs(blob, vNombre);
                        this.mensajesService.msgSuccessMixin("Reporte de usuarios", "Descargado correctamente")
                    } else {
                        this.mensajesService.msgError("Error al descargar el archivo");
                    }
                },
                error: (error: any) => {
                    this.mensajesService.msgError("Error al descargar el archivo: " + error);
                }
            });
        }
    }

    get Usuario(): any { return this.frmUsuario.get('usuario'); }
    get Estado(): any { return this.frmUsuario.get('estado'); }
    get Sexo(): any { return this.frmUsuario.get('sexo'); }
    get RolId(): any { return this.frmUsuario.get('rol'); }
}

export class GrillaPaginado implements DataSource<IUsuario> {
    private listaSubject = new BehaviorSubject<IUsuario[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public totalItems = 0;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private usuarioService: UsuarioService, private mensajesService: MensajesService) { }

    listar(filtro: IUsuarioFiltroPaginado) {
        this.mensajesService.msgLoad("Cargando...");
        this.loadingSubject.next(true);
        this.usuarioService.listarPaginado(filtro).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false)))
            .subscribe((response: any) => {
                if (response.success) {
                    this.listaSubject.next(response.data.lista);
                    this.totalItems = response.data.Total;
                }
                else {
                    this.listaSubject.next([]);
                    this.totalItems = 0;
                    this.loadingSubject.next(false)
                }
            },
                (error: any) => {
                    this.loadingSubject.next(false)
                });
        this.mensajesService.msgAutoClose();
    }

    connect(collectionViewer: CollectionViewer): Observable<IUsuario[]> {
        return this.listaSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.listaSubject.complete();
        this.loadingSubject.complete();
    }
}
