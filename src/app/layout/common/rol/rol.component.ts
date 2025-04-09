import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations/public-api';
import { MatSelectModule } from '@angular/material/select';
import { MensajesService } from 'app/core/services/messages.service';
import { User } from 'app/core/user/user.types';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { UsuarioRolInicialDto } from 'app/core/interfaces/iUsuario';

@Component({
    selector: 'rol',
    templateUrl: './rol.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs: 'fuseSearch',
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
    providers: [

    ],
})
export class RolComponent implements OnInit {
    frmCabecera: FormGroup;
    lstRoles: UsuarioRolInicialDto[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private formBuilder: FormBuilder,
        private mensajesService: MensajesService,
        private authService: AuthService,
        private _userService: UserService,
    ) {
        this.frmCabecera = this.formBuilder.group({
            IdEntidad: [0],
            IdRol: [0],
        });
    }

    ngOnInit(): void {
        this.IdRol.setValue(this.authService.accessRolIdGlobal);

        this._userService.lstRoles$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((lstRoles: UsuarioRolInicialDto[]) => {

                this.lstRoles = lstRoles;
            });

    }

    seleccionarRol() {
        this.mensajesService.msgLoad("Procesando...");
        /*
        if (this.IdRol.value != undefined && this.IdRol.value != null && this.IdRol.value > 0) {
            this.authService.accessRolIdGlobal = this.IdRol.value;
            this.authService.accessCodigoRolGlobal = this.lstRoles.find(obj => obj.Id == this.IdRol.value).Codigo;

            this.usuarioService.ObtenerMenuPorRol(this.IdRol.value)
                .subscribe((response) => {
                    if (response.success) {


                        this.authService.accessToken = response.validations[0].message;

                        const helper = new JwtHelperService();
                        const vToken: string | null = this.accessToken;
                        const decodedToken = helper.decodeToken(vToken?.toString());

                        let vUsuario = {
                            id: decodedToken.Id,
                            name: decodedToken.Nombres + " " + decodedToken.ApellidoPaterno + " " + decodedToken.ApellidoMaterno,
                            email: decodedToken.Email,
                            avatar: "assets/images/avatars/no_image.jpg",
                            status: "online"
                        } as User;

                        let ojbRespuesta = {
                            accesToken: this.accessToken,
                            tokenType: "bearer",
                            user: vUsuario
                        }

                        let respuesta = {} as StatusResponse<any>;
                        respuesta.data = ojbRespuesta;
                        respuesta.success = true;

                        this._userService.user = vUsuario;
                        this.authService._authenticated = true;



                        this.lstMenu = response.data.filter(item => item.Id != 100061);


                        let menuPaths = this.lstMenu.map(x => x.Ruta).filter(x => x !== null && x !== undefined && x !== "").join(';');
                        localStorage.setItem('menuPaths', this.authService.encriptar(menuPaths));

                        this._userService.lstMenu = {
                            default: this.buildTree1(this.lstMenu, 0)
                        } as Navigation;

                        this.emitService.cambioEntidadRol$.emit({ "idUsuario": this.usuarioId, "idEntidad": this.authService.accessEntidadIdGlobal, "idRol": this.authService.accessRolIdGlobal });
                        this.router.navigate(['/principal']);
                    }
                    else {
                        this.lstMenu = [];
                        //this.lstMenu1 = [];
                    }
                    this.mensajesService.msgAutoClose();
                },
                    (error: any) => {
                        const mensaje = environment.mensajesError.noCargaMenu + ' '
                            + environment.mensajesError.sinConexion;
                        this.mensajesService.msgError(mensaje);
                        this.mensajesService.msgAutoClose();
                    });
            this.seleccionarValidacion();

        } else {
            this.lstMenu = [];
            this.mensajesService.msgAutoClose();
        }
        */
    }

    get IdRol() { return this.frmCabecera.get('IdRol') }
}
