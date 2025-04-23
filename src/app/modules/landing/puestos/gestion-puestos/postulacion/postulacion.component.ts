import { CommonModule, DatePipe } from '@angular/common';
import { Component , Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormArray,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDateRangePicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OnlyLetterDirective } from 'app/core/directives/onlyLetter.directive';
import { OnlyNumberDirective } from 'app/core/directives/onlyNumber.directive';
import { ICatalogoDetalle } from 'app/core/interfaces/iCatalogoDetalle';
import { CatalogoDetalleService } from 'app/core/services/catalogodetalle.service';
import { MensajesService } from 'app/core/services/messages.service';
import { PuestosService } from 'app/core/services/puestos.service';
import { RecaptchaService } from 'app/core/services/recaptcha.service';

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
    selector: 'postulacion',
    templateUrl: './postulacion.component.html',
    encapsulation: ViewEncapsulation.None,
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
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        OnlyNumberDirective,
        ReactiveFormsModule,
    ],
})
export class PostulacionComponent implements OnInit  {
    boton : boolean = true;
    titulo: string = "";
    Id?: number;
    nNuevo: boolean = false;
    postulacionForm: UntypedFormGroup;
    lstTipoDoc: ICatalogoDetalle[] = [];
    lstEstado: ICatalogoDetalle[] = [];

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PostulacionComponent>,
        private _formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private mensajesService: MensajesService,
        private catalogoDetalleService: CatalogoDetalleService,
        private puestosService: PuestosService,
        private recaptchaService: RecaptchaService
    ) {
        this.Id = data.Id;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.postulacionForm = this._formBuilder.group({
            nombres:    ['', Validators.required],
            paterno:    ['', Validators.required],
            materno:    ['', Validators.required],
            correo:    ['', [Validators.required, Validators.email]],
            celular:    ['', [Validators.required, Validators.minLength(9) , Validators.pattern('^[0-9]{9}$')]],
            tipodoc:    [-1, Validators.required],
            dni:        ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
            documento:  this._formBuilder.array([], Validators.required)

        });

        this.listarTipoDoc();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    listarTipoDoc() {
        this.catalogoDetalleService.listarTipoDoc()
            .subscribe((response) => {
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
                    this.mensajesService.msgError("No se pudieron cargar los registros");
                    this.mensajesService.msgAutoClose();
                });
    }

    // Manejar cambio de archivos
    onFileChange(event: any): void {
        const fileArray = this.postulacionForm.get('documento') as FormArray;
        const files = event.target.files;

        const maxFiles = 1;

        while (fileArray.length > 0) {
            fileArray.removeAt(0);
        }

        if (files.length === 0) {
            fileArray.setErrors({ required: true });
            this.postulacionForm.updateValueAndValidity();
            return;
        }

        if (files.length > maxFiles) {
            fileArray.setErrors({ maxFiles: true });
            this.postulacionForm.updateValueAndValidity();
            return;
        }

        let hasError = false;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];

            if (!allowedTypes.includes(file.type)) {
                fileArray.setErrors({ fileType: true });
                hasError = true;
                break;
            }

            if (file.size > 10 * 1024 * 1024) {
                fileArray.setErrors({ fileSize: true });
                hasError = true;
                break;
            }

            fileArray.push(new FormControl(file));
        }

        if (!hasError) {
            fileArray.setErrors(null);
        }

        this.postulacionForm.updateValueAndValidity();
    }

    saveAndClose(): void {
        // Save the message as a draft
        this.cancelar();

        // Close the dialog
        this.matDialogRef.close();
    }

    /**
     * Discard the message
     */
    cancelar(): void {}

    /**
     * Save the message as a draft
     */

    guardar() : void {
        // El formulario debe estar válido
        if (this.postulacionForm.valid) {
            this.mensajesService.msgConfirm("¿Está seguro que desea guardar los datos?", async () => {
                this.mensajesService.msgLoad("Procesando...");

                try{
                    const token = await this.recaptchaService.executeRecaptcha('submit');

                    const formData = new FormData();
                    formData.append('Nombres', this.postulacionForm.get('nombres').value);
                    formData.append('ApellidoPaterno', this.postulacionForm.get('paterno').value);
                    formData.append('ApellidoMaterno', this.postulacionForm.get('materno').value);
                    formData.append('TipoDocumento', this.postulacionForm.get('tipodoc').value);
                    formData.append('NumeroDocumento', this.postulacionForm.get('dni').value);
                    formData.append('PuestoId', this.Id.toString());
                    formData.append('Celular', this.postulacionForm.get('celular').value);
                    formData.append('Correo', this.postulacionForm.get('correo').value);
                    formData.append('RecaptchaToken', token);

                    const documentoArray = this.postulacionForm.get('documento') as FormArray;
                    if (documentoArray && documentoArray.length > 0) {
                        formData.append('archivo', documentoArray.at(0).value); // nombre 'ArchivoCV' puede ser el que esperas en backend
                    }

                    this.puestosService.postular(formData).subscribe(
                        (response) => {
                            if (response.success) {
                                this.mensajesService.msgSuccessMixin("Datos actualizados correctamente", "");
                                this.postulacionForm.reset();
                                this.matDialogRef.close(true);
                            } else {
                                this.mensajesService.msgError("Error: " + response.validations[0].message);
                            }
                        },
                        (error: any) => {
                            this.mensajesService.msgError("No se pudieron guardar los cambios: " + error.message);
                        }
                    );

                } catch (error) {
                    this.mensajesService.msgError("Error al ejecutar reCAPTCHA");
                }
            },
        );
        } else {
            this.mensajesService.msgWarning("Hay campos pendientes de validación");
        }
    }
}
