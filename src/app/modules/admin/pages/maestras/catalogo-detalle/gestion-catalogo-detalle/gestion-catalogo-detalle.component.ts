import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { OnlyLetterDirective } from "app/core/directives/onlyLetter.directive";
import { ICatalogo, ICatalogoDetalle } from "app/core/interfaces/iCatalogoDetalle";
import { CatalogoDetalleService } from "app/core/services/catalogodetalle.service";
import { MensajesService } from "app/core/services/messages.service";

@Component({
    selector: 'app-gestion-catalogo-detalle',
    templateUrl: './gestion-catalogo-detalle.component.html',
    styleUrls: ['./gestion-catalogo-detalle.component.scss'],
    standalone: true,
    providers: [],
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
    ]
})

export class GestionCatalogoDetalleComponent implements OnInit {
    boton : boolean = true;
    titulo: string = "";
    Id?: number;
    frmDisabled: boolean = false;
    nNuevo: boolean = false;
    catalogoDetalleForm: UntypedFormGroup;
    lstCatalogo: ICatalogo[] = [];
    lstEstado: ICatalogoDetalle[] = [];

    constructor(
        public matDialogRef: MatDialogRef<GestionCatalogoDetalleComponent>,
        private _formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private mensajesService: MensajesService,
        private catalogoDetalleService: CatalogoDetalleService
    ) {
        this.titulo = data.titulo;
        this.nNuevo = data.nNuevo;
        this.Id = data.Id;
        this.frmDisabled = data.frmDisabled;
        this.catalogoDetalleForm = this._formBuilder.group({
            nombre:         [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            codigo:         [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            descripcion:    [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            abreviatura:    [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            ordenamiento:   [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            catalogo:       [{value: -1, disabled: this.frmDisabled},   [Validators.required]],
            estado:         [{value: '', disabled: this.frmDisabled},   [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.listarCatalogo();
        this.listarEstado();

        if (this.Id != undefined && this.Id > 0) {
            this.obtenerPorId(this.Id);
        } else {
            // Habilitar el campo de código
            this.catalogoDetalleForm.controls['codigo'].enable();
            this.nNuevo = false;
        }
    }

    obtenerPorId(vId: number) {
        this.mensajesService.msgLoad("Procesando...");
        this.catalogoDetalleService.obtenerPorId(vId)
            .subscribe((response) => {
                if (response.success) {
                    this.catalogoDetalleForm.controls['nombre'].setValue(response.data.Nombre);
                    this.catalogoDetalleForm.controls['catalogo'].setValue(response.data.IdCatalogo);
                    this.catalogoDetalleForm.controls['abreviatura'].setValue(response.data.Abreviatura);
                    this.catalogoDetalleForm.controls['descripcion'].setValue(response.data.Descripcion);
                    this.catalogoDetalleForm.controls['codigo'].setValue(response.data.Codigo);
                    this.catalogoDetalleForm.controls['ordenamiento'].setValue(response.data.Ordenamiento);
                    this.catalogoDetalleForm.controls['estado'].setValue(response.data.Estado.toString());
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
        if (this.catalogoDetalleForm.valid) {
            this.mensajesService.msgConfirm('¿Está seguro de guardar la información registrada?', () => {
                this.mensajesService.msgLoad("Procesando...");
                let iCatalogoDetalle = {} as ICatalogoDetalle;
                iCatalogoDetalle.Id = this.Id;
                iCatalogoDetalle.Nombre = this.Nombre.value;
                iCatalogoDetalle.Codigo = this.Codigo.value;
                iCatalogoDetalle.Abreviatura = this.Abreviatura.value;
                iCatalogoDetalle.Descripcion = this.Descripcion.value;
                iCatalogoDetalle.Ordenamiento = this.Ordenamiento.value;
                iCatalogoDetalle.Catalogo = this.Catalogo.value;
                iCatalogoDetalle.Estado = this.Estado.value;

                this.catalogoDetalleService.insertar(iCatalogoDetalle)
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
            this.catalogoDetalleForm.markAsUntouched();
        }
    }

    saveAndClose(): void {
        this.matDialogRef.close();
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

    get Nombre(): any { return this.catalogoDetalleForm.get('nombre'); }
    get Codigo(): any { return this.catalogoDetalleForm.get('codigo'); }
    get Abreviatura(): any { return this.catalogoDetalleForm.get('abreviatura'); }
    get Descripcion(): any { return this.catalogoDetalleForm.get('descripcion'); }
    get Ordenamiento(): any { return this.catalogoDetalleForm.get('ordenamiento'); }
    get Catalogo(): any { return this.catalogoDetalleForm.get('catalogo'); }
    get Estado(): any { return this.catalogoDetalleForm.get('estado'); }
}

export function rolValidator(control: AbstractControl): ValidationErrors | null {
    return control.value === -1 ? { invalidRol: true } : null;
}
