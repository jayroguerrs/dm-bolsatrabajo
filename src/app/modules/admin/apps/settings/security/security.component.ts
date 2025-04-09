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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { IClave } from 'app/core/interfaces/iSeguridad';
import { MensajesService } from 'app/core/services/messages.service';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,
        MatButtonModule,
    ],
})
export class SettingsSecurityComponent implements OnInit {
    securityForm: UntypedFormGroup;
    @Input() Id: number;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private mensajesService: MensajesService,
        private authService: AuthService,
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.securityForm = this._formBuilder.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required]],
            twoStep: [true],
            askPasswordChange: [false],
        });
    }

    cancel(): void{
        this._router.navigate(['/']);
    }

    save(){
        // El formulario debe estar válido
        if (this.securityForm.valid) {
            this.mensajesService.msgConfirm("¿Está seguro que desea guardar los datos?", () => {
                this.mensajesService.msgLoad("Procesando...");
                let iClave: IClave = {
                    Id : this.Id,
                    Password1: this.securityForm.get('currentPassword').value,
                    Password2: this.securityForm.get('newPassword').value,
                };
                this.authService.cambiarClave(iClave)
                    .subscribe((response) => {
                        if (response.success) {
                            this.mensajesService.msgSuccessMixin("Realizado, por favor inicie sesión...", "");
                            setTimeout(() => {
                                this._router.navigate(['/admin/sign-out']);
                            }, 700);
                        } else {
                            this.mensajesService.msgError(response.validations[0].message);
                        }

                        //Restablecer formulario
                        this.securityForm.reset();
                }
                , (error: any) => {
                    this.mensajesService.msgError("Error al cambiar la clave: " + error.message);
                });
            });
        }
    }
}
