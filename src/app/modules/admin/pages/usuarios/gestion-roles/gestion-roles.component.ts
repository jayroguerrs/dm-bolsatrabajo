import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { OnlyLetterDirective } from "app/core/directives/onlyLetter.directive";
import { IRolCombo, IRolFiltroCombo } from "app/core/interfaces/iRol";
import { IUsuarioAsociarRol } from "app/core/interfaces/iUsuario";
import { MensajesService } from "app/core/services/messages.service";
import { RolService } from "app/core/services/rol.service";
import { UsuarioService } from "app/core/services/usuario.service";

@Component({
    selector: 'gestion-roles',
    templateUrl: './gestion-roles.component.html',
    styleUrls: ['./gestion-roles.component.scss'],
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

export class GestionRolesComponent implements OnInit {
    boton : boolean = true;
    titulo: string = "";
    Id?: number;
    rolesForm: UntypedFormGroup;
    nNuevo: boolean = false;
    lstRol: IRolCombo[] = [];

    constructor(
        public matDialogRef: MatDialogRef<GestionRolesComponent>,
        private _formBuilder: UntypedFormBuilder,
        private rolService: RolService,
        private mensajesService: MensajesService,
        private usuarioService: UsuarioService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ){
        this.titulo = data.titulo;
        this.Id = data.Id;

        this.rolesForm = this._formBuilder.group({
            nombres:    [{value: '', disabled : true },   [Validators.required]],
            rol:        [{value: -1, disabled : false},   [Validators.required, rolValidator]],
        });
    }

    ngOnInit(): void {
        this.listarRol();
        this.Nombres.setValue(this.data.Nombres);
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

    guardar(): void {
        if (this.rolesForm.valid) {
            this.mensajesService.msgConfirm('¿Está seguro de guardar la información registrada?', () => {
                this.mensajesService.msgLoad("Procesando...");
                let iRoles = {
                    IdRolUsuario: this.Id,
                    RolId: this.Rol.value
                } as IUsuarioAsociarRol;

                this.usuarioService.asociarRol(iRoles)
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
            this.rolesForm.markAsUntouched();
        }
    }

    get Nombres(): any { return this.rolesForm.get('nombres'); }
    get Rol(): any { return this.rolesForm.get('rol'); }
}

export function rolValidator(control: AbstractControl): ValidationErrors | null {
    return control.value === -1 ? { invalidRol: true } : null;
}
