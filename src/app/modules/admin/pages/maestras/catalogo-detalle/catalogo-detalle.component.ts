import { TextFieldModule } from "@angular/cdk/text-field";
import { CommonModule, DatePipe } from "@angular/common";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { OnlyLetterDirective } from "app/core/directives/onlyLetter.directive";
import { MensajesService } from "app/core/services/messages.service";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, catchError, finalize, merge, of, tap } from "rxjs";
import { ICatalogo, ICatalogoDetalle, ICatalogoDetalleFiltro, ICatalogoDetalleFiltroPaginado } from "app/core/interfaces/iCatalogoDetalle";
import { CatalogoDetalleService } from "app/core/services/catalogodetalle.service";
import { MyCustomPaginatorIntl } from "app/getPaginatorIntl";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { GestionCatalogoDetalleComponent } from "./gestion-catalogo-detalle/gestion-catalogo-detalle.component";
import FileSaver from "file-saver";

@Component({
    selector        : 'catalogo-detalle',
    templateUrl     : './catalogo-detalle.component.html',
    styleUrls       : ['./catalogo-detalle.component.scss'],
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
    ]
})

export class CatalogoDetalleComponent implements OnInit, AfterViewInit {
    columnasTabla: string[] = ['acciones', 'nombre', 'catalogo', 'estado', 'fechaCreacion', 'responsable' ];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    frmCatalogoDetalle: UntypedFormGroup;
    lstCatalogo : ICatalogo[] = [];
    lstEstado: ICatalogoDetalle[] = [];
    filtro: ICatalogoDetalleFiltroPaginado;

    constructor(
        private mensajesService: MensajesService,
        private _formBuilder: UntypedFormBuilder,
        private catalogoDetalleService: CatalogoDetalleService,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.frmCatalogoDetalle = this._formBuilder.group({
            nombre: [''],
            estado: [''],
            catalogo : [-1]
        });

        this.listarCatalogo();
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

    cargarPaginado() {

        this.filtro = {
            NumeroPagina: this.paginator.pageIndex + 1,
            TamanioPagina: this.paginator.pageSize,
            SortOrder: this.sort.direction,
            SortColumn: this.sort.active,
            IdCatalogo: this.filtro.IdCatalogo,
            Nombre: this.filtro.Nombre,
            Estado: this.filtro.Estado
        }
        this.dataSource.listar(this.filtro);
    }

    cargarOrdenamiento() {

        this.filtro.SortOrder = this.sort.direction;
        this.filtro.SortColumn = this.sort.active;
        this.dataSource.listar(this.filtro);
    }

    inicializarDataGrid() {
        this.paginator.firstPage();
        this.filtro = {
            NumeroPagina: 1,
            TamanioPagina: 10,
            SortOrder: "",
            SortColumn: "",
            IdCatalogo: -1,
            Estado: -1,
            Nombre: ""
        }
        this.dataSource = new GrillaPaginado(this.catalogoDetalleService, this.mensajesService);
        this.dataSource.listar(this.filtro);
    }

    abrirModalCatalogoDetalle(vId?: number, frmDisabled?: boolean) {
        let textoTitulo: string = "";
        let nNuevo: boolean = false;

        if (vId == 0 || vId == null || vId == undefined) {
            textoTitulo = "Registrar Catalogo Detalle";
            nNuevo = true;
        } else {
            textoTitulo = "Modificar Catalogo Detalle";
        }

        if (frmDisabled) {
            textoTitulo = "Visualizar Catalogo Detalle";
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

        const dialogRef = this._matDialog.open(GestionCatalogoDetalleComponent, dialogConfig);
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

    listarCatalogo() {
        this.catalogoDetalleService.listarCatalogoCmb()
            .subscribe((response) => {
                if (response.success) {
                    let lstCatalogo = [];
                    let iTodos = {
                        IdCatalogo: -1,
                        Nombre: "-- TODOS --"
                    } as ICatalogo;
                    lstCatalogo.push(iTodos);

                    response.data.forEach(function (item) {
                        lstCatalogo.push(item);
                    })
                    this.lstCatalogo = lstCatalogo;
                }
                else {
                    this.lstCatalogo = [];
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

    listarResumen() {
        this.paginator.firstPage();
        this.filtro.Estado = this.Estado.value;
        this.filtro.Nombre = this.Nombre.value;
        this.filtro.IdCatalogo = this.IdCatalogo.value;

        this.dataSource.listar(this.filtro);

    };

    limpiar() {
        /*
        this.Estado.setValue("");
        this.Sexo.setValue(-1);
        this.RolId.setValue(-1);
        this.Usuario.setValue("");
        this.paginator.pageSize = this.filtro.TamanioPagina;
        this.listarResumen();
        */
    }

    ReporteExcel() {

        if (this.dataSource.totalItems === 0) {
            this.mensajesService.msgExportarVacio;
        } else {
            this.mensajesService.msgLoad("Descargando...");
            let filtroReporte = {
                Nombre: this.filtro.Nombre,
                IdCatalogo: this.filtro.IdCatalogo,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as ICatalogoDetalleFiltro;

            //1: Excel, 2: PDF
            this.catalogoDetalleService.generarReporte(filtroReporte, 1).subscribe({
                next: (respuesta: any) => {
                    ;
                    if (respuesta != null) {
                        const blob = new Blob([respuesta], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const vNombre = "ListaCatalogoDetalle_" + (new Date).toLocaleDateString() + ".xlsx";
                        FileSaver.saveAs(blob, vNombre);
                        this.mensajesService.msgSuccessMixin("Reporte de Catálogo Detalle", "Descargado correctamente")
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
                Nombre: this.filtro.Nombre,
                IdCatalogo: this.filtro.IdCatalogo,
                Estado: this.filtro.Estado,
                SortColumn : this.sort.active,
                SortOrder : this.sort.direction
            } as ICatalogoDetalleFiltro;

            //1: Excel, 2: PDF
            this.catalogoDetalleService.generarReporte(filtroReporte, 2).subscribe({
                next: (respuesta: any) => {
                    ;
                    if (respuesta != null) {
                        const blob = new Blob([respuesta], { type: 'application/pdf' });
                        const vNombre = "ListaCatalogoDetalle_" + (new Date).toLocaleDateString() + ".pdf";
                        FileSaver.saveAs(blob, vNombre);
                        this.mensajesService.msgSuccessMixin("Reporte de Catálogo Detalle", "Descargado correctamente")
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

    get Nombre(): any { return this.frmCatalogoDetalle.get('nombre'); }
    get Estado(): any { return this.frmCatalogoDetalle.get('estado'); }
    get IdCatalogo(): any { return this.frmCatalogoDetalle.get('catalogo'); }
}

export class GrillaPaginado implements DataSource<ICatalogoDetalle> {
    private listaSubject = new BehaviorSubject<ICatalogoDetalle[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public totalItems = 0;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private catalogoDetalleService: CatalogoDetalleService, private mensajesService: MensajesService) { }

    listar(filtro: ICatalogoDetalleFiltroPaginado) {
        this.mensajesService.msgLoad("Cargando...");
        this.loadingSubject.next(true);
        this.catalogoDetalleService.listarPaginado(filtro).pipe(
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

    connect(collectionViewer: CollectionViewer): Observable<ICatalogoDetalle[]> {
        return this.listaSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.listaSubject.complete();
        this.loadingSubject.complete();
    }

}
