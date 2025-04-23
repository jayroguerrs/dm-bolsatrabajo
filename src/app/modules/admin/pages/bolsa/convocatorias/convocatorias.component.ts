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
import { OnlyLetterDirective } from 'app/core/directives/onlyLetter.directive';

import * as FileSaver from 'file-saver';
import { FormularioService } from 'app/core/services/formulario.service';
import { EventoService } from 'app/core/services/evento.service';
import { IEventoCombo, IEventoFiltroCombo } from 'app/core/interfaces/iEvento';
import { IFormulario, IFormularioFiltro, IFormularioFiltroPaginado } from 'app/core/interfaces/iFormulario';
import { Router } from '@angular/router';
import { PuestosService } from 'app/core/services/puestos.service';
import { IPuestos, IPuestosFiltroPaginado, IPuestosFiltroPaginadoNoCaptcha } from 'app/core/interfaces/iPuestos';
import { GestionConvocatoriasComponent } from './gestion-convocatoria/gestion-convocatoria.component';

@Component({
    selector        : 'convocatorias',
    templateUrl     : './convocatorias.component.html',
    styleUrls       : ['./convocatorias.component.scss'],
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
export class ConvocatoriasComponent implements OnInit, AfterViewInit {
    columnasTabla: string[] = ['acciones', 'titulo', 'estado', 'fechaCreacion', 'responsable' ];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    filtro: IPuestosFiltroPaginadoNoCaptcha;
    lstEstado: ICatalogoDetalle[] = [];
    lstCatalogoDetalle: ICatalogoDetalle[] = [];
    frmPuestos: UntypedFormGroup;

    constructor(
        private puestosService: PuestosService,
        private catalogoDetalleService: CatalogoDetalleService,
        private eventoService: EventoService,
        private mensajesService: MensajesService,
        private _formBuilder: UntypedFormBuilder,
        private _matDialog: MatDialog,
        private router: Router,
    )
    {}

    ngOnInit(): void {
        this.frmPuestos = this._formBuilder.group({
            fechareg: [''],
            titulo: [''],
            estado : ['']
        });

        this.listarEstado();
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

    verFormulario(vId?: number ): void {
        this.router.navigate(['admin/formulario/agregar/' + vId.toString()]);
    }

    agregarFormulario(): void {
        this.router.navigate(['admin/formulario/agregar']);
    }

    respuestas(vId: number, vTitulo: string): void {
        // Guardar en localStorage para persistencia
        localStorage.setItem('titulo_respuesta', vTitulo);

        this.router.navigate(['admin/formulario/listar-respuestas/' + vId.toString()], { state: { titulo: vTitulo } });
    }

    inicializarDataGrid() {
        this.paginator.firstPage();
        this.filtro = {
            NumeroPagina: 1,
            TamanioPagina: 10,
            SortOrder: "",
            SortColumn: "",
            Titulo: "",
            Ubicacion: "",
            FechaRegistro: null,
            Estado: -1
        }
        this.dataSource = new GrillaPaginado(this.puestosService, this.mensajesService);
        this.dataSource.listar(this.filtro);
    }

    cargarPaginado() {

        this.filtro = {
            NumeroPagina: this.paginator.pageIndex + 1,
            TamanioPagina: this.paginator.pageSize,
            SortOrder: this.sort.direction,
            SortColumn: this.sort.active,
            Titulo: this.filtro.Titulo,
            Ubicacion: this.filtro.Ubicacion,
            Estado: this.filtro.Estado,
            FechaRegistro: this.filtro.FechaRegistro,
        }
        this.dataSource.listar(this.filtro);
    }

    cargarOrdenamiento() {

        this.filtro.SortOrder = this.sort.direction;
        this.filtro.SortColumn = this.sort.active;
        this.dataSource.listar(this.filtro);
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

    listarResumen(est: number = 0) {

        this.paginator.firstPage();
        this.filtro.FechaRegistro = this.FechaRegistro.value;
        this.filtro.Titulo = this.Titulo.value;
        //this.filtro.Ubicacion = this.Ubicacion.value;
        this.filtro.Estado = this.Estado.value;

        this.dataSource.listar(this.filtro);
    };

    link(vLink?: string) {

    }

    limpiar() {
        this.FechaRegistro.setValue("");
        this.Titulo.setValue("");
        this.Estado.setValue("");
        this.paginator.pageSize = this.filtro.TamanioPagina;
        this.listarResumen(1);
    }

    eliminar(vId?: number) {
        /*
        if (vId != undefined && vId > 0) {
            this.mensajesService.msgConfirm("¿Está seguro de eliminar el registro?", () => {
                this.mensajesService.msgLoad("Procesando...");
                this.puestosService.eliminar({ Id: vId }).subscribe((respuesta: { success: boolean; }) => {
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
        */
    }

    ReporteExcel() {
        /*
        if (this.dataSource.totalItems === 0) {
            this.mensajesService.msgExportarVacio;
        } else {
            this.mensajesService.msgLoad("Descargando...");
            let filtroReporte = {
                Titulo: this.filtro.Titulo,
                EventoId: this.filtro.EventoId,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as IFormularioFiltro;

            //1: Excel, 2: PDF
            this.formularioService.generarReporte(filtroReporte, 1).subscribe({
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
        */
    }

    ReportePDF() {
        /*
        if (this.dataSource.totalItems === 0) {
            this.mensajesService.msgExportarVacio;
        } else {
            this.mensajesService.msgLoad("Descargando...");
            let filtroReporte = {
                EventoId: this.filtro.EventoId,
                Titulo: this.filtro.Titulo,
                Fecha: this.filtro.Fecha,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as IFormularioFiltro;

            //1: Excel, 2: PDF
            this.formularioService.generarReporte(filtroReporte, 2).subscribe({
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
        */
    }

    abrirModalConvocatoria(vId?: number, frmDisabled?: boolean) {
        let textoTitulo: string = "";
        let nNuevo: boolean = false;

        if (vId == 0 || vId == null || vId == undefined) {
            textoTitulo = "Crear Convocatoria";
            nNuevo = true;
        } else {
            textoTitulo = "Editar Convocatoria";
        }

        if (frmDisabled) {
            textoTitulo = "Visualizar Convocatoria";
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

        const dialogRef = this._matDialog.open(GestionConvocatoriasComponent, dialogConfig);
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

    get FechaRegistro(): any { return this.frmPuestos.get('fechareg'); }
    get Titulo(): any { return this.frmPuestos.get('titulo'); }
    get Nombre(): any { return this.frmPuestos.get('nombre'); }
    get Estado(): any { return this.frmPuestos.get('estado'); }
}

export class GrillaPaginado implements DataSource<IPuestos> {
    private listaSubject = new BehaviorSubject<IPuestos[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public totalItems = 0;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private puestosService: PuestosService, private mensajesService: MensajesService) { }

    listar(filtro: IPuestosFiltroPaginadoNoCaptcha) {
        this.mensajesService.msgLoad("Cargando...");
        this.loadingSubject.next(true);
        this.puestosService.listarPaginadoNoCaptcha(filtro).pipe(
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

    connect(collectionViewer: CollectionViewer): Observable<IPuestos[]> {
        return this.listaSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.listaSubject.complete();
        this.loadingSubject.complete();
    }
}
