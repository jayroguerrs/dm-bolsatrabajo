import { TextFieldModule } from '@angular/cdk/text-field';
import {CommonModule} from '@angular/common';
import {
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardComponent } from '@fuse/components/card';
import { MensajesService } from 'app/core/services/messages.service';
import { UsuarioService } from 'app/core/services/usuario.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FuseCardComponent,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatDividerModule,
        MatTooltipModule,
    ],
})
export class ProfileComponent implements OnInit {
    user: User;
    Bio: string = '';
    FechaNacimiento: Date;
    Correo: string = '';
    Anexo: string = '';
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private usuarioService: UsuarioService,
        private mensajesService: MensajesService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void
    {
        // Subscribe to user changes
        this._userService.user$
            .subscribe((user: User) => {
                this.user = user;
                this.obtenerDatos();
            });
    }

    obtenerDatos() : void {

        if (!this.user || !this.user.id) {
            return;
        }
        this.mensajesService.msgLoad("Procesando...");
        this.usuarioService.obtenerDatos(this.user.id)
            .subscribe((response) => {
                if (response.success) {
                        if (response.success) {
                        this.Bio = response.data.Bio;
                        this.FechaNacimiento = response.data.FechaNacimiento;
                        this.Correo = response.data.Email;
                        this.Anexo = response.data.Telefono;
                        this._cdr.markForCheck();
                        this.mensajesService.msgAutoClose();
                    }
                }
        }, (error: any) => {
            this.mensajesService.msgError("No se pudieron obtener los datos: " + error.message);
        });
    }
}
