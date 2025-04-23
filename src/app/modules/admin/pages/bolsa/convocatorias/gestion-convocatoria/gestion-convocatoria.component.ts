import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { OnlyLetterDirective } from "app/core/directives/onlyLetter.directive";
import { ICatalogoDetalle } from "app/core/interfaces/iCatalogoDetalle";
import { CatalogoDetalleService } from "app/core/services/catalogodetalle.service";
import { MensajesService } from "app/core/services/messages.service";
import { QuillEditorComponent } from 'ngx-quill';

const DATE_MODE_FORMATS = {
    parse: {
        dateInput: 'L',
    },
    display: {
        dateInput: 'L',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    }
};

@Component({
    selector        : 'gestion-convocatoria',
    templateUrl     : './gestion-convocatoria.component.html',
    styleUrls       : ['./gestion-convocatoria.component.scss'],
    encapsulation   : ViewEncapsulation.None,
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
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        OnlyLetterDirective,
        QuillEditorComponent,
        ReactiveFormsModule,
    ],

})
export class GestionConvocatoriasComponent implements OnInit {
    boton : boolean = true;
    titulo: string = "";
    Id?: number;
    frmDisabled: boolean = false;
    nNuevo: boolean = false;
    puestoForm: UntypedFormGroup;
    lstEstado: ICatalogoDetalle[] = [];
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };

    constructor(
        public matDialogRef: MatDialogRef<GestionConvocatoriasComponent>,
        private _formBuilder: UntypedFormBuilder,
        private catalogoDetalleService: CatalogoDetalleService,
        private mensajesService: MensajesService,
    ){
        this.puestoForm = this._formBuilder.group({
            titulo:             [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            descripcion:        [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            departamento:       [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            distrito:           [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            rangofecha: this._formBuilder.group({
                fechainicio: new FormControl<Date | null>(null),
                fechafin: new FormControl<Date | null>(null),
            }),
            //rol:        [{value: -1, disabled: this.frmDisabled},   [Validators.required, rolValidator]],
            codigo:     [{value: '', disabled: true},               [Validators.required, Validators.pattern('^[0-9]{5}$')]],
            correo:     [{value: '', disabled: this.frmDisabled},   [Validators.required, Validators.email]],
            estado:     [{value: '', disabled: this.frmDisabled},   [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.listarEstado();
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

    listarDepartamento() {
        this.departamentoService.listarEstado()
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

    saveAndClose(){};
}
