import { CommonModule, DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatButtonModule } from "@angular/material/button";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { OnlyLetterDirective } from "app/core/directives/onlyLetter.directive";
import { ICatalogoDetalle } from "app/core/interfaces/iCatalogoDetalle";
import { IPuestosInsUpd } from "app/core/interfaces/iPuestos";
import { IDepartamentoCombo, IDistritoCombo, IDistritoFiltroCombo } from "app/core/interfaces/iUbicacion";
import { CatalogoDetalleService } from "app/core/services/catalogodetalle.service";
import { MensajesService } from "app/core/services/messages.service";
import { PuestosService } from "app/core/services/puestos.service";
import { UbicacionService } from "app/core/services/ubicacion.service";
import moment from "moment";
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
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        OnlyLetterDirective,
        ReactiveFormsModule,
        MatDatepickerModule,
        QuillEditorComponent,
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
    lstDepartamento: IDepartamentoCombo[] = [];
    lstDistrito: IDistritoCombo[] = [];
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
        @Inject(MAT_DIALOG_DATA) private data: any,
        private catalogoDetalleService: CatalogoDetalleService,
        private mensajesService: MensajesService,
        private ubicacionService: UbicacionService,
        private puestosService: PuestosService,
    ){
        this.titulo = data.titulo;
        this.nNuevo = data.nNuevo;
        this.Id = data.Id;
        this.frmDisabled = data.frmDisabled;
        this.puestoForm = this._formBuilder.group({
            titulo:             [{value: '', disabled: this.frmDisabled}, [Validators.required]],
            descripcion:        [{value: '', disabled: this.frmDisabled}, [Validators.required]],
            departamento:       [{value: -1, disabled: this.frmDisabled}, [Validators.required]],
            distrito:           [{value: '', disabled: this.frmDisabled}, [Validators.required]],
            rangofecha: this._formBuilder.group({
                fechainicio: [{ value: null, disabled: this.frmDisabled }],
                fechafin: [{ value: null, disabled: this.frmDisabled }],
            }),
        });
    }

    ngOnInit(): void {
        this.listarEstado();
        this.listarDepartamento();

        if (this.Id != undefined && this.Id > 0) {
            this.obtenerPorId(this.Id);
        } else {
            // Habilitar el campo de código
            //this.eventoForm.controls['codigo'].enable();
            this.nNuevo = false;
        }
    }

    obtenerPorId(vId: number) {
        this.mensajesService.msgLoad("Procesando...");
        this.puestosService.obtenerPorId({ Id: vId })
            .subscribe((response) => {
                if (response.success) {
                    debugger;
                    this.puestoForm.controls['titulo'].setValue(response.data.Titulo.toString());
                    this.puestoForm.controls['descripcion'].setValue(response.data.Descripcion.toString());
                    this.puestoForm.controls['departamento'].setValue(response.data.DepartamentoId);
                    //this.puestoForm.controls['estado'].setValue(response.data.Estado.toString());

                    // Primero carga los distritos
                    this.listarDistrito(response.data.DepartamentoId);
                    this.puestoForm.controls['distrito'].setValue(response.data.DistritoId);

                    const fechaInicio = response.data.FechaIni ? moment(response.data.FechaIni) : null;
                    const fechaFin = response.data.FechaFin ? moment(response.data.FechaFin) : null;

                    this.puestoForm.get('rangofecha')?.setValue({
                        fechainicio: fechaInicio,
                        fechafin: fechaFin
                    });

                    this.mensajesService.msgAutoClose();
                } else {
                    this.mensajesService.msgError("No se pudo obtener el registro");
                    this.mensajesService.msgAutoClose();
                }
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudo obtener el registro");
                this.mensajesService.msgAutoClose();
            });
    }

    guardar(): void {
        if (this.puestoForm.valid) {
            debugger;
            this.mensajesService.msgConfirm('¿Está seguro de guardar la información registrada?', () => {
                this.mensajesService.msgLoad("Procesando...");
                let iPuestos = {} as IPuestosInsUpd;
                iPuestos.Id = this.Id;
                iPuestos.Titulo = this.Titulo.value;
                iPuestos.Descripcion = this.Descripcion.value;

                // Recuperar correctamente las fechas del grupo 'rangofecha'
                const rangoFecha = this.puestoForm.get('rangofecha')?.value;

                // Convertir a formato compatible con DateOnly (YYYY-MM-DD)
                iPuestos.FechaInicial = rangoFecha?.fechainicio
                    ? moment(rangoFecha.fechainicio).format('YYYY-MM-DD')
                    : '';

                iPuestos.FechaFinal = rangoFecha?.fechafin
                    ? moment(rangoFecha.fechafin).format('YYYY-MM-DD')
                    : '';

                iPuestos.DistritoId = this.Distrito.value;
                //iPuestos.Estado = this.Estado.value;

                this.puestosService.insertar(iPuestos)
                    .subscribe((response) => {
                        if (response.success) {
                            this.matDialogRef.close(response);
                        } else {
                            this.mensajesService.msgWarning(response.validations[0].message);
                        }
                    },
                    (error: any) => {
                        if (error.error.errors[""] != undefined) {
                            let vMensajes = "";
                            if (error.error.errors[""].length > 0) {
                                error.error.errors[""].forEach(
                                    function (item) {
                                        vMensajes = item + "<br />";
                                    });
                                this.mensajesService.msgWarning(vMensajes);
                            } else {
                                this.mensajesService.msgWarning("Error al registrar");
                            }
                        } else {
                            this.mensajesService.msgWarning("Error al registrar");
                        }
                    });
            });
        } else {
            this.mensajesService.msgWarning("Ingrese todos los campos obligatorios");
            this.puestoForm.markAsUntouched();
        }
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
        this.ubicacionService.listarDepartamento({ Estado: 1 })
            .subscribe((response) => {
                if (response.success) {
                    let lstDepartamento = [];
                    let iTodos = {
                        DepaId: -1,
                        Nombre: "-- TODOS --"
                    } as IDepartamentoCombo;
                    lstDepartamento.push(iTodos);

                    response.data.forEach(function (item) {
                        lstDepartamento.push(item);
                    })
                    this.lstDepartamento = lstDepartamento;
                }
                else {
                    this.lstDepartamento = [];
                }
                this.mensajesService.msgAutoClose();
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudieron cargar los registros");
                this.mensajesService.msgAutoClose();
            });
    }

    listarDistrito(vDepaId: number) {

        // Limpiar el distrito seleccionado
        this.puestoForm.get('distrito')?.setValue('');

        let filtro = {
            DepaId: vDepaId,
            Estado: 1,
        } as IDistritoFiltroCombo;

        this.ubicacionService.listarDistrito(filtro)
            .subscribe((response) => {
                if (response.success) {
                    let lstDistrito = [];
                    let iTodos = {
                        DistritoId: -1,
                        Nombre: "-- TODOS --"
                    } as IDistritoCombo;
                    lstDistrito.push(iTodos);

                    response.data.forEach(function (item) {
                        lstDistrito.push(item);
                    })
                    this.lstDistrito = lstDistrito;
                }
                else {
                    this.lstDistrito = [];
                }
                this.mensajesService.msgAutoClose();
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudieron cargar los registros");
                this.mensajesService.msgAutoClose();
            });
    }

    saveAndClose(){
        this.matDialogRef.close();
    };

    get Titulo(): any { return this.puestoForm.get('titulo'); }
    get Descripcion(): any { return this.puestoForm.get('descripcion'); }
    get Departamento(): any { return this.puestoForm.get('departamento'); }
    get Distrito(): any { return this.puestoForm.get('distrito'); }
    get Estado(): any { return this.puestoForm.get('estado'); }
    get FechaIni(): any { return this.puestoForm.get('rangofecha').get('fechainicio'); }
    get FechaFin(): any { return this.puestoForm.get('rangofecha').get('fechafin');}

}
