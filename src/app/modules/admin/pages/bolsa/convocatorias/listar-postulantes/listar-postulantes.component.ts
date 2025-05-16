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
import { EventoService } from 'app/core/services/evento.service';
import { IEventoCombo, IEventoFiltroCombo } from 'app/core/interfaces/iEvento';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PuestosService } from 'app/core/services/puestos.service';
import { IPostulantes, IPostulantesFiltro, IPostulantesFiltroPaginado } from 'app/core/interfaces/iPuestos';
import { environment } from 'environments/environments';

@Component({
    selector        : 'listar-postulantes',
    templateUrl     : './listar-postulantes.component.html',
    styleUrls       : ['./listar-postulantes.component.scss'],
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
        OnlyLetterDirective,
        RouterLink
    ],

})
export class ListarPostulantesComponent implements OnInit, AfterViewInit {
    columnasTabla: string[] = ['acciones', 'nombres', 'correo', 'archivo', 'estado', 'fechaCreacion'];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    filtro: IPostulantesFiltroPaginado;
    lstEstado: ICatalogoDetalle[] = [];
    lstEvento: IEventoCombo[] = [];
    lstCatalogoDetalle: ICatalogoDetalle[] = [];
    frmUsuario: UntypedFormGroup;
    puestoId: number | null = null;
    titulo: string = "";

    constructor(
        private postulantesService: PuestosService,
        private catalogoDetalleService: CatalogoDetalleService,
        private eventoService: EventoService,
        private mensajesService: MensajesService,
        private _formBuilder: UntypedFormBuilder,
        private _matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private route: ActivatedRoute,
    )
    {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.titulo = navigation.extras.state['titulo'];
        } else {
            this.titulo = localStorage.getItem('titulo_respuesta');
        }
    }

    ngOnInit(): void {
        this.frmUsuario = this._formBuilder.group({
            nombres: [''],
            correo: [''],
            estado: [''],
            numdoc: [''],
        });

        // Verificar si hay ID en la ruta
        this.activatedRoute.params.subscribe(params => {
            this.puestoId = params['id'] ? +params['id'] : null;

            this.listarEstado();
            this.inicializarDataGrid(this.puestoId);
        });

    }

    ngAfterViewInit(): void {
        merge(this.sort.sortChange)
        .pipe(tap(() => this.cargarOrdenamiento()))
        .subscribe();

        merge(this.paginator.page)
            .pipe(tap(() => this.cargarPaginado()))
            .subscribe();
    }

    inicializarDataGrid(vId: number | null) {
        this.paginator.firstPage();
        this.filtro = {
            NumeroPagina: 1,
            TamanioPagina: 10,
            SortOrder: "",
            SortColumn: "",
            NumeroDocumento: "",
            Nombres: "",
            Correo: "",
            PuestoId: vId,
            Estado: -1
        }
        this.dataSource = new GrillaPaginado(this.postulantesService, this.mensajesService);
        this.dataSource.listar(this.filtro);
    }

    cargarPaginado() {

        this.filtro = {
            NumeroPagina: this.paginator.pageIndex + 1,
            TamanioPagina: this.paginator.pageSize,
            SortOrder: this.sort.direction,
            SortColumn: this.sort.active,
            Nombres: this.filtro.Nombres,
            Correo: this.filtro.Correo,
            NumeroDocumento: this.filtro.NumeroDocumento,
            PuestoId: this.filtro.PuestoId,
            Estado: this.filtro.Estado
        }
        this.dataSource.listar(this.filtro);
    }

    cargarOrdenamiento()
    {
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

    listarResumen() {

        this.paginator.firstPage();
        this.filtro.NumeroDocumento = this.NumDoc.value;
        this.filtro.Correo = this.Correo.value;
        this.filtro.Nombres = this.Nombres.value;
        this.filtro.Estado = this.Estado.value;
        this.filtro.PuestoId = this.puestoId;
        this.dataSource.listar(this.filtro);
    };

    limpiar() {
        this.NumDoc.setValue("");
        this.Estado.setValue("");
        this.Nombres.setValue("");
        //this.ForesId.setValue("");
        this.paginator.pageSize = this.filtro.TamanioPagina;
        this.listarResumen();
    }

    eliminar(vId?: number) {
        if (vId != undefined && vId > 0) {
            this.mensajesService.msgConfirm("¿Está seguro de eliminar el registro?", () => {
                this.mensajesService.msgLoad("Procesando...");
                this.postulantesService.eliminar({Id: vId}).subscribe((respuesta: { success: boolean; }) => {
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
                NumeroDocumento: this.filtro.NumeroDocumento,
                Nombres: this.filtro.Nombres,
                PuestoId: this.puestoId,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as IPostulantesFiltro;

            //1: Excel, 2: PDF
            this.postulantesService.generarPostulantesReporte(filtroReporte, 1).subscribe({
                next: (respuesta: any) => {
                    ;
                    if (respuesta != null) {
                        const blob = new Blob([respuesta], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const vNombre = "ListaPostulantes_" + (new Date).toLocaleDateString() + ".xlsx";
                        FileSaver.saveAs(blob, vNombre);
                        this.mensajesService.msgSuccessMixin("Reporte de Postulantes", "Descargado correctamente")
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
                NumeroDocumento: this.filtro.NumeroDocumento,
                Nombres: this.filtro.Nombres,
                PuestoId: this.puestoId,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as IPostulantesFiltro;

            //1: Excel, 2: PDF
            this.postulantesService.generarPostulantesReporte(filtroReporte, 2).subscribe({
                next: (respuesta: any) => {
                    ;
                    if (respuesta != null) {
                        const blob = new Blob([respuesta], { type: 'application/pdf' });
                        const vNombre = "ListaPostulantes_" + (new Date).toLocaleDateString() + ".pdf";
                        FileSaver.saveAs(blob, vNombre);
                        this.mensajesService.msgSuccessMixin("Reporte de Postulantes", "Descargado correctamente")
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

    AbrirCV(url: string) {
        this.mensajesService.msgLoad("Descargando...");
        if (url) {
            const downloadUrl = `${environment.apiURL}/f/SecureFiles${url}`;

            fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    // Agrega headers si necesitas autenticación
                    // 'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    this.mensajesService.msgErrorMixin("Curriculum Vitae", "Error al descargar el archivo");
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = this.extraerNombreArchivo(url); // nombre sugerido
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                this.mensajesService.msgSuccessMixin("Curriculum Vitae", "Descarga correcta");
            })
            .catch(error => {
                console.error('Error al descargar el archivo:', error);
            });
        } else {
            console.error('URL no válida');
        }
    }

    private extraerNombreArchivo(url: string): string {
        return url.split('/').pop() || 'archivo.pdf';
    }

    getFileName(filePath: string): string {
        if (!filePath) return '';
        const parts = filePath.split('/');
        return parts[parts.length - 1]; // Devuelve el último segmento de la ruta
    }

    get Nombres(): any { return this.frmUsuario.get('nombres'); }
    get NumDoc(): any { return this.frmUsuario.get('numdoc'); }
    get Correo(): any { return this.frmUsuario.get('correo'); }
    get Estado(): any { return this.frmUsuario.get('estado'); }
}

export class GrillaPaginado implements DataSource<IPostulantes> {
    private listaSubject = new BehaviorSubject<IPostulantes[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public totalItems = 0;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private puestosService: PuestosService, private mensajesService: MensajesService) { }

    listar(filtro: IPostulantesFiltroPaginado) {
        this.mensajesService.msgLoad("Cargando...");
        this.loadingSubject.next(true);
        this.puestosService.listarPostulantesPaginado(filtro).pipe(
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

    connect(collectionViewer: CollectionViewer): Observable<IPostulantes[]> {
        return this.listaSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.listaSubject.complete();
        this.loadingSubject.complete();
    }
}
