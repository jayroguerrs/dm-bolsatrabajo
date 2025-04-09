import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ICatalogoDetalle } from 'app/core/interfaces/iCatalogoDetalle';
import { IUsuarioDatos } from 'app/core/interfaces/iUsuario';
import { CatalogoDetalleService } from 'app/core/services/catalogodetalle.service';
import { MensajesService } from 'app/core/services/messages.service';
import { UsuarioService } from 'app/core/services/usuario.service';
import { flatMap, forkJoin, tap } from 'rxjs';

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
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' }, },
        { provide: DatePipe },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: DATE_MODE_FORMATS }
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
    ],
})
export class SettingsAccountComponent implements OnInit {
    accountForm: UntypedFormGroup;
    lstTipoDoc: ICatalogoDetalle[] = [];
    lstSexo: ICatalogoDetalle[] = [];
    //vId: number = 0;
    @Input() Id: number;
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private mensajesService: MensajesService,
        private usuarioService: UsuarioService,
        private catalogoDetalleService: CatalogoDetalleService
    ) {
        this.accountForm = this._formBuilder.group({
            //codigo      : [{value: '', disabled: true}, Validators.required],
            nombres     : ['', Validators.required],
            paterno     : ['', Validators.required],
            materno     : ['', Validators.required],
            tipodoc     : [-1],
            numdoc      : [''],
            sexo        : [-1],
            email       : ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@derrama.org.pe$/)]],
            telephone   : ['', [Validators.pattern(/^9\d{8}$/)]],
            fechanac    : [''],
            bio    : [''],
        });

        // Initialize lstTipoDoc with default value
        this.lstTipoDoc = [{ Id: -1, Codigo: "", Nombre: "-- SELECCIONE --" }];
        this.lstSexo = [{ Id: -1, Codigo: "", Nombre: "-- SELECCIONE --" }];

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Load the catalog and gender before obtaining data
        forkJoin({
            tipoDoc: this.listarTipoDoc(),
            genero: this.listarGenero()
        }).subscribe({
            next: () => {
                this.obtenerDatos();
            },
            error: (error) => {
                this.mensajesService.msgError("Error al cargar los catálogos: " + error.message);
            }
        });

    }

    cancel(): void
    {
        this._router.navigate(['/']);
    }

    obtenerDatos() : void {
        this.usuarioService.obtenerDatos(this.Id)
            .subscribe((response) => {
                if (response.success) {
                        if (response.success) {
                        //this.accountForm.get('codigo').setValue(response.data.Codigo);
                        this.accountForm.get('nombres').setValue(response.data.Nombres);
                        this.accountForm.get('paterno').setValue(response.data.ApellidoPaterno);
                        this.accountForm.get('materno').setValue(response.data.ApellidoMaterno);
                        this.accountForm.get('tipodoc').setValue(response.data.TipoDocumento);
                        this.accountForm.get('sexo').setValue(response.data.Sexo);
                        this.accountForm.get('numdoc').setValue(response.data.NumeroDocumento);
                        this.accountForm.get('email').setValue(response.data.Email);
                        this.accountForm.get('telephone').setValue(response.data.Telefono);
                        this.accountForm.get('fechanac').setValue(response.data.FechaNacimiento);
                        this.accountForm.get('bio').setValue(response.data.Bio);
                    }
                }
        }, (error: any) => {
            this.mensajesService.msgError("No se pudieron obtener los datos: " + error.message);
        });
    }

    listarTipoDoc() {
        return this.catalogoDetalleService.listarTipoDoc()
            .pipe(tap((response) => {
                if (response.success) {
                    let lstTipoDoc = [];
                    let iTodos = {
                        Id: -1,
                        Codigo: "",
                        Nombre: "-- SELECCIONE --"
                    } as ICatalogoDetalle;
                    lstTipoDoc.push(iTodos);

                    response.data.forEach(function (item) {
                        lstTipoDoc.push(item);
                    })
                    this.lstTipoDoc = lstTipoDoc;
                }
                else {
                    this.lstTipoDoc = [];
                }
                this.mensajesService.msgAutoClose();
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudieron cargar los registros: " + error.message);
            })
        );
    }

    listarGenero() {
        return this.catalogoDetalleService.listarGenero()
            .pipe(tap((response) => {
                if (response.success) {
                    let lstSexo = [];
                    let iTodos = {
                        Id: -1,
                        Codigo: "",
                        Nombre: "-- SELECCIONE --"
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
            })
        );

    }

    save() : void {
        // El formulario debe estar válido
        if (this.accountForm.valid) {
            this.mensajesService.msgConfirm("¿Está seguro que desea guardar los datos?", () => {
                this.mensajesService.msgLoad("Procesando...");

                let iUsuario: IUsuarioDatos = {
                    Id: this.Id,
                    Nombres: this.accountForm.get('nombres').value,
                    //Codigo: this.accountForm.get('codigo').value,
                    FechaNacimiento: new Date(this.accountForm.get('fechanac').value),
                    ApellidoPaterno: this.accountForm.get('paterno').value,
                    ApellidoMaterno: this.accountForm.get('materno').value,
                    TipoDocumento: this.accountForm.get('tipodoc').value,
                    Sexo: this.accountForm.get('sexo').value,
                    NumeroDocumento: this.accountForm.get('numdoc').value,
                    Email: this.accountForm.get('email').value,
                    Telefono: this.accountForm.get('telephone').value,
                    Bio: this.accountForm.get('bio').value,
                };
                this.usuarioService.actualizarDatos(iUsuario)
                    .subscribe((response) => {
                        if (response.success) {
                            this.mensajesService.msgSuccessMixin("Datos actualizados correctamente", "");
                        }
                        else {
                            this.mensajesService.msgError("No se pudo guardar los datos");
                        }
                    },
                    (error: any) => {
                        this.mensajesService.msgError("No se guardar los cambios: " + error.message);
                    });
            },
        );
        } else {
            this.mensajesService.msgWarning("Hay campos pendientes de validación");
        }

    }
}
