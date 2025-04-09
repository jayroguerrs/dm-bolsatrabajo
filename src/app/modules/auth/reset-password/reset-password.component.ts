import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';
import { Error404Component } from "../../admin/apps/error/error-404/error-404.component";
import { MensajesService } from 'app/core/services/messages.service';
import { IClave } from 'app/core/interfaces/iSeguridad';

@Component({
    selector: 'auth-reset-password',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
    FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    Error404Component
],
})
export class AuthResetPasswordComponent implements OnInit {
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    pagina: string = '';
    Id: number = 0;
    Token: string = '';

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private mensajesService: MensajesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Leer el token y el Id de la URL
        this.Token = new URLSearchParams(window.location.search).get('token');
        this.Id = Number(new URLSearchParams(window.location.search).get('id'));
        this.validadCredeciales(this.Token, this.Id);

        // Create the form
        this.resetPasswordForm = this._formBuilder.group(
            {
                password: ['', Validators.required],
                passwordConfirm: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch(
                    'password',
                    'passwordConfirm'
                ),
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Validar credenciales
     */
    validadCredeciales(Token: string, Id: number): void {

        this.mensajesService.msgLoad("Procesando...");

        this._authService.validarURLRestablecer(Token, Id)
        .subscribe((response) => {
            if (response.success) {
                // Set the alert
                this.pagina = 'reset-password';
                this.mensajesService.msgAutoClose();
            } else {
                this.pagina = 'error404';
                this.mensajesService.msgAutoClose();
            }
        },
        (error: any) => {
            this.mensajesService.msgError("No se pudo obtener el registro");
            this.mensajesService.msgAutoClose();
        });

    }

    /**
     * Reset password
     */
    resetPassword(): void {
        // Return if the form is invalid
        if (this.resetPasswordForm.invalid) {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        let iClave: IClave = {
            Id : this.Id,
            Password1: this.resetPasswordForm.get('password').value,
            Password2: this.resetPasswordForm.get('passwordConfirm').value,
            Token: this.Token,
        };

        // Send the request to the server
        this._authService.cambiarClaveNoAuth(iClave)
            .pipe(
                finalize(() => {
                    // Re-enable the form
                    this.resetPasswordForm.enable();

                    // Reset the form
                    this.resetPasswordNgForm.resetForm();

                    // Show the alert
                    this.showAlert = true;
                })
            )
            .subscribe((response) => {
                if (response.success) {
                    this.alert = {
                        type: 'success',
                        message: 'Su contraseña ha sido restablecida.',
                    };
                }
                else {
                    this.alert = {
                        type: 'error',
                        message: 'Ha ocurrido un error. Por favor, inténtelo de nuevo.',
                    };
                }
        })

    }
}
