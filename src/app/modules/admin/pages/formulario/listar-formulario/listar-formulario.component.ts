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

@Component({
    selector        : 'listar-formulario',
    templateUrl     : './listar-formulario.component.html',
    styleUrls       : ['./listar-formulario.component.scss'],
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
export class ListarFormularioComponent implements OnInit, AfterViewInit {
    columnasTabla: string[] = ['acciones', 'titulo', 'evento', 'estado', 'fechaCreacion', 'responsable' ];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    filtro: IFormularioFiltroPaginado;
    lstEstado: ICatalogoDetalle[] = [];
    lstEvento: IEventoCombo[] = [];
    lstCatalogoDetalle: ICatalogoDetalle[] = [];
    frmUsuario: UntypedFormGroup;

    constructor(
        private formularioService: FormularioService,
        private catalogoDetalleService: CatalogoDetalleService,
        private eventoService: EventoService,
        private mensajesService: MensajesService,
        private _formBuilder: UntypedFormBuilder,
        private _matDialog: MatDialog,
        private router: Router,
    )
    {}

    ngOnInit(): void {
        this.frmUsuario = this._formBuilder.group({
            titulo: [''],
            estado: [''],
            evento: [-1],
        });

        this.listarEvento();
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
        debugger;
        this.router.navigate(['formulario/listar-formulario/' + vId.toString()]);
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

        /*
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
        */
    }

    inicializarDataGrid() {
        this.paginator.firstPage();
        this.filtro = {
            NumeroPagina: 1,
            TamanioPagina: 10,
            SortOrder: "",
            SortColumn: "",
            EventoId: -1,
            Titulo: "",
            Estado: -1
        }
        this.dataSource = new GrillaPaginado(this.formularioService, this.mensajesService);
        this.dataSource.listar(this.filtro);
    }

    cargarPaginado() {

        this.filtro = {
            NumeroPagina: this.paginator.pageIndex + 1,
            TamanioPagina: this.paginator.pageSize,
            SortOrder: this.sort.direction,
            SortColumn: this.sort.active,
            Titulo: this.filtro.Titulo,
            EventoId: this.filtro.EventoId,
            Estado: this.filtro.Estado
        }
        this.dataSource.listar(this.filtro);
    }

    cargarOrdenamiento() {

        this.filtro.SortOrder = this.sort.direction;
        this.filtro.SortColumn = this.sort.active;
        this.dataSource.listar(this.filtro);
    }

    listarEvento() {
        let filtro = {
            Estado: -1
        } as IEventoFiltroCombo;
        this.eventoService.listarCmb(filtro)
            .subscribe((response) => {
                if (response.success) {
                    let lstEvento = [];
                    let iTodos = {
                        Id: -1,
                        Nombre: "-- TODOS --"
                    } as IEventoCombo;
                    lstEvento.push(iTodos);

                    response.data.forEach(function (item) {
                        lstEvento.push(item);
                    })
                    this.lstEvento = lstEvento;
                }
                else {
                    this.lstEvento = [];
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

    notificar(usuarioId : number) : void{

    }

    listarResumen() {

        this.paginator.firstPage();
        this.filtro.Estado = this.Estado.value;
        this.filtro.Titulo = this.Titulo.value;
        this.filtro.EventoId = this.Evento.value;
        this.dataSource.listar(this.filtro);
    };

    link() : void {

    }

    limpiar() {
        this.Estado.setValue("");
        this.Evento.setValue(-1);
        this.Titulo.setValue("");
        this.paginator.pageSize = this.filtro.TamanioPagina;
        this.listarResumen();
    }

    eliminar(vId?: number) {
        if (vId != undefined && vId > 0) {
            this.mensajesService.msgConfirm("¿Está seguro de eliminar el registro?", () => {
                this.mensajesService.msgLoad("Procesando...");
                this.formularioService.eliminar({ Id: vId }).subscribe((respuesta: { success: boolean; }) => {
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
    }

    ReportePDF() {
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
    }

    get Evento(): any { return this.frmUsuario.get('evento'); }
    get Titulo(): any { return this.frmUsuario.get('titulo'); }
    get Estado(): any { return this.frmUsuario.get('estado'); }
}

export class GrillaPaginado implements DataSource<IFormulario> {
    private listaSubject = new BehaviorSubject<IFormulario[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public totalItems = 0;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private formularioService: FormularioService, private mensajesService: MensajesService) { }

    listar(filtro: IFormularioFiltroPaginado) {
        this.mensajesService.msgLoad("Cargando...");
        this.loadingSubject.next(true);
        this.formularioService.listarPaginado(filtro).pipe(
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

    connect(collectionViewer: CollectionViewer): Observable<IFormulario[]> {
        return this.listaSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.listaSubject.complete();
        this.loadingSubject.complete();
    }
}
