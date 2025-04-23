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
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { environment } from 'environments/environments';
import { ReCaptchaV3Service, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaService } from 'app/core/services/recaptcha.service';

const DATE_MODE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    }
};

@Component({
    selector    : 'puestos',
    templateUrl : './puestos.component.html',
    styleUrls   : ['./puestos.component.scss'],
    standalone  : true,
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' }, },
        { provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl },
        { provide: DatePipe },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: DATE_MODE_FORMATS }
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
        RecaptchaModule,
        RecaptchaFormsModule,
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
    columnasTabla: string[] = [ 'titulo', 'fechaCreacion', 'fechafin', 'ubicacion' ];
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    dataSource: GrillaPaginado;
    filtro: IPuestosFiltroPaginado;
    frmPuestos: UntypedFormGroup;
    selectedRow: IPuestos;
    public recaptchaSiteKey = environment.recaptchaSiteKey; // Usa tu site key de environment
    public recaptchaToken: string | null = null;
    public isRecaptchaLoaded = false;
    //dataSource: GrillaPaginado = new GrillaPaginado(this.puestosService, this.mensajesService);
    loading$: Observable<boolean>;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private mensajesService: MensajesService,
        private puestosService: PuestosService,
        private router: Router,
        private recaptchaService: RecaptchaService
    )
    {
        //this.loading$ = this.dataSource.loading$;
        //this.recaptchaService.executeRecaptcha().catch(() => {});
    }

    ngOnInit(): void {

        this.frmPuestos = this._formBuilder.group({
            fechareg: [''],
            titulo: [''],
            ubicacion : ['']
        });

        this.inicializarDataGrid();

    }

    limpiar() {
        this.Ubicacion.setValue("");
        this.FechaRegistro.setValue("");
        this.Titulo.setValue("");
        this.paginator.pageSize = this.filtro.TamanioPagina;
        this.listarResumen(1);
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
            FechaRegistro: this.filtro.FechaRegistro,
            RecaptchaToken: ""
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
            Estado: -1,
            RecaptchaToken: ""
        }
        this.dataSource = new GrillaPaginado(this.puestosService, this.mensajesService, this.recaptchaService);
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

    listarResumen(est: number = 0) {

        this.paginator.firstPage();
        this.filtro.FechaRegistro = this.FechaRegistro.value;
        this.filtro.Titulo = this.Titulo.value;
        this.filtro.Ubicacion = this.Ubicacion.value;
        this.filtro.Estado = -1;
        this.filtro.RecaptchaToken = '';

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

    constructor(
        private puestosService: PuestosService,
        private mensajesService: MensajesService,
        private recaptchaService: RecaptchaService
    ) { }

    async listar(filtro: IPuestosFiltroPaginado, est: number = 0) {

        try{

            this.mensajesService.msgLoad("Cargando...");
            this.loadingSubject.next(true);

            const token = await this.recaptchaService.executeRecaptcha('submit');
            filtro.RecaptchaToken = token;

            this.puestosService.listarPaginado(filtro).pipe(
                    catchError(() => of([])),
                    finalize(() => this.loadingSubject.next(false)))
                .subscribe((response: any) => {
                    if (response.success) {
                        this.listaSubject.next(response.data.lista);
                        this.totalItems = response.data.Total;
                        est == 1 ? this.mensajesService.msgSuccessMixin("Filtros aplicados correctamente", "") : "";
                    } else {
                        this.listaSubject.next([]);
                        this.totalItems = 0;
                        this.loadingSubject.next(false)
                        this.mensajesService.msgError("Error: " + response.validations[0].message);
                    }
                },
                    (error: any) => {
                        this.loadingSubject.next(false)
                    });
            this.mensajesService.msgAutoClose();

        } catch (error) {
            this.loadingSubject.next(false);
            this.mensajesService.msgError("Error en reCAPTCHA");
        }
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
