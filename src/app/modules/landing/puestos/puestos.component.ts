import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MensajesService } from 'app/core/services/messages.service';
import { FormularioService } from 'app/core/services/formulario.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IFormularioRespuesta, RespuestaDto } from 'app/core/interfaces/iFormulario';
import { DynamicDatepickerComponent } from 'app/shared/components/dynamic-datepicker/dynamic-datepicker.component';
import { OnlyNumberDirective } from 'app/core/directives/onlyNumber.directive';
import { FuseCardComponent } from '@fuse/components/card';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { IPuestos, IPuestosFiltroPaginado } from 'app/core/interfaces/iPuestos';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, catchError, finalize, merge, of, tap } from 'rxjs';
import { PuestosService } from 'app/core/services/puestos.service';
import { MatTableModule } from '@angular/material/table';
import { MyCustomPaginatorIntl } from 'app/getPaginatorIntl';
import { Router } from '@angular/router';

@Component({
    selector    : 'puestos',
    templateUrl : './puestos.component.html',
    styleUrls   : ['./puestos.component.scss'],
    standalone  : true,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' }, },
        { provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl },
        { provide: DatePipe }
    ],
    imports      : [
        CommonModule,
        DynamicDatepickerComponent,
        FuseCardComponent,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatRadioModule,
        MatTableModule,
        MatSelectModule,
        MatSortModule,
        TextFieldModule,
        ReactiveFormsModule,
        OnlyNumberDirective,
    ],
    animations: [
        trigger('fadeInOut', [
          state('void', style({
            opacity: 0
          })),
          transition(':enter, :leave', [
            animate(600)
          ])
        ])
    ]
})
export class PuestosComponent
{
    columnasTabla: string[] = [ 'titulo', 'fechafin', 'ubicacion' ];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    filtro: IPuestosFiltroPaginado;
    frmPuestos: UntypedFormGroup;
    selectedRow: IPuestos;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private mensajesService: MensajesService,
        private puestosService: PuestosService,
        private router: Router
    )
    {
    }

    ngOnInit(): void {

        this.frmPuestos = this._formBuilder.group({
            //estado: [''],
            fechareg: [''],
            titulo: [''],
            ubicacion : ['']
        });

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
            Titulo: this.filtro.Titulo,
            Ubicacion: this.filtro.Ubicacion,
            Estado: this.filtro.Estado,
            FechaRegistro: this.filtro.FechaRegistro
        }
        this.dataSource.listar(this.filtro);
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

    abrirPostulacion(row: IPuestos) {
        this.selectedRow = row; // Asigna la fila seleccionada
        this.router.navigate(['./puestos/', row.Id.toString()]);
    }

    cargarOrdenamiento() {

        this.filtro.SortOrder = this.sort.direction;
        this.filtro.SortColumn = this.sort.active;
        this.dataSource.listar(this.filtro);
    }

    listarResumen() {
        this.paginator.firstPage();
        this.filtro.FechaRegistro = this.FechaRegistro.value;
        this.filtro.Titulo = this.Titulo.value;
        this.filtro.Ubicacion = this.Ubicacion.value;
        this.filtro.Estado = -1;

        this.dataSource.listar(this.filtro);
    };

    get FechaRegistro(): any { return this.frmPuestos.get('fechareg'); }
    get Titulo(): any { return this.frmPuestos.get('titulo'); }
    get Nombre(): any { return this.frmPuestos.get('nombre'); }
    get Ubicacion(): any { return this.frmPuestos.get('ubicacion'); }

}

export class GrillaPaginado implements DataSource<IPuestos> {
    private listaSubject = new BehaviorSubject<IPuestos[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public totalItems = 0;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private puestosService: PuestosService, private mensajesService: MensajesService) { }

    listar(filtro: IPuestosFiltroPaginado) {
        this.mensajesService.msgLoad("Cargando...");
        this.loadingSubject.next(true);
        this.puestosService.listarPaginado(filtro).pipe(
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

export function fechaValida(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
        return null; // Permitir valores vacíos si no es requerido
    }

    // Intentar parsear la fecha
    const fecha = new Date(control.value);
    const esFechaValida = !isNaN(fecha.getTime());

    if (!esFechaValida) {
        return { fechaInvalida: true }; // Retorna un error si no es una fecha válida
    }

    return null; // Si la fecha es válida, no hay error
}
