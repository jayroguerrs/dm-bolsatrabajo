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
import { ICatalogoDetalle } from "app/core/interfaces/iCatalogoDetalle";
import { IRolCombo, IRolFiltroCombo } from "app/core/interfaces/iRol";
import { IUsuarioRolIns } from "app/core/interfaces/iUsuario";
import { CatalogoDetalleService } from "app/core/services/catalogodetalle.service";
import { MensajesService } from "app/core/services/messages.service";
import { RolService } from "app/core/services/rol.service";
import { UsuarioService } from "app/core/services/usuario.service";

@Component({
    selector: 'app-gestion-usuario',
    templateUrl: './gestion-usuario.component.html',
    styleUrls: ['./gestion-usuario.component.scss'],
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

export class GestionUsuarioComponent implements OnInit {
    boton : boolean = true;
    titulo: string = "";
    Id?: number;
    frmDisabled: boolean = false;
    nNuevo: boolean = false;
    usuarioForm: UntypedFormGroup;
    lstRol: IRolCombo[] = [];
    lstEstado: ICatalogoDetalle[] = [];

    constructor(
        public matDialogRef: MatDialogRef<GestionUsuarioComponent>,
        private _formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private rolService: RolService,
        private usuarioService: UsuarioService,
        private mensajesService: MensajesService,
        private catalogoDetalleService: CatalogoDetalleService
    ) {
        this.titulo = data.titulo;
        this.nNuevo = data.nNuevo;
        this.Id = data.Id;
        this.frmDisabled = data.frmDisabled;
        this.usuarioForm = this._formBuilder.group({
            paterno:    [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            materno:    [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            nombres:    [{value: '', disabled: this.frmDisabled},   [Validators.required]],
            rol:        [{value: -1, disabled: this.frmDisabled},   [Validators.required, rolValidator]],
            codigo:     [{value: '', disabled: true},               [Validators.required, Validators.pattern('^[0-9]{5}$')]],
            correo:     [{value: '', disabled: this.frmDisabled},   [Validators.required, Validators.email]],
            estado:     [{value: '', disabled: this.frmDisabled},   [Validators.required]],
        });
    }

    ngOnInit(): void {

        this.listarRol();
        this.listarEstado();

        if (this.Id != undefined && this.Id > 0) {
            this.obtenerPorId(this.Id);
        } else {
            // Habilitar el campo de código
            this.usuarioForm.controls['codigo'].enable();
            this.nNuevo = false;
        }
    }

    obtenerPorId(vId: number) {
        this.mensajesService.msgLoad("Procesando...");

        this.usuarioService.obtenerDatosRolUsuario(vId)
            .subscribe((response) => {
                if (response.success) {
                    this.usuarioForm.controls['paterno'].setValue(response.data.ApellidoPaterno);
                    this.usuarioForm.controls['materno'].setValue(response.data.ApellidoMaterno);
                    this.usuarioForm.controls['nombres'].setValue(response.data.Nombres);
                    this.usuarioForm.controls['correo'].setValue(response.data.Correo);
                    this.usuarioForm.controls['rol'].setValue(response.data.RolId);
                    this.usuarioForm.controls['codigo'].setValue(response.data.Codigo);
                    this.usuarioForm.controls['estado'].setValue(response.data.Estado);
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
        if (this.usuarioForm.valid) {
            this.mensajesService.msgConfirm('¿Está seguro de guardar la información registrada?', () => {
                this.mensajesService.msgLoad("Procesando...");
                let iUsuario = {} as IUsuarioRolIns;
                iUsuario.ApellidoMaterno = this.Materno.value;
                iUsuario.ApellidoPaterno = this.Paterno.value;
                iUsuario.Nombres = this.Nombres.value;
                iUsuario.RolId = this.Rol.value;
                iUsuario.Codigo = this.Codigo.value;
                iUsuario.Correo = this.Correo.value;
                iUsuario.Estado = this.Estado.value;

                this.usuarioService.insertar(this.Id, iUsuario)
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
            this.usuarioForm.markAsUntouched();
        }
    }

    saveAndClose(): void {
        this.matDialogRef.close();
    }

    listarRol() {
        let filtro = {
            IdTipoRol: 1
        } as IRolFiltroCombo;
        this.rolService.listarCmb(filtro)
            .subscribe((response) => {
                if (response.success) {
                    let lstRol = [];
                    let iTodos = {
                        Id: -1,
                        Nombre: "-- TODOS --"
                    } as IRolCombo;
                    lstRol.push(iTodos);

                    response.data.forEach(function (item) {
                        lstRol.push(item);
                    })
                    this.lstRol = lstRol;
                }
                else {
                    this.lstRol = [];
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

    get Paterno(): any { return this.usuarioForm.get('paterno'); }
    get Materno(): any { return this.usuarioForm.get('materno'); }
    get Nombres(): any { return this.usuarioForm.get('nombres'); }
    get Rol(): any { return this.usuarioForm.get('rol'); }
    get Codigo(): any { return this.usuarioForm.get('codigo'); }
    get Correo(): any { return this.usuarioForm.get('correo'); }
    get Estado(): any { return this.usuarioForm.get('estado'); }
}

export function rolValidator(control: AbstractControl): ValidationErrors | null {
    return control.value === -1 ? { invalidRol: true } : null;
}
