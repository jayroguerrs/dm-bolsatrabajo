import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import {
    FuseNavigationItem,
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UsuarioMenuDto, UsuarioRolInicialDto } from 'app/core/interfaces/iUsuario';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { MensajesService } from 'app/core/services/messages.service';
import { UsuarioService } from 'app/core/services/usuario.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { UserComponent } from 'app/layout/common/user/user.component';
import { environment } from 'environments/environments';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StatusResponse } from 'app/core/services/StatusResponse.model';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
    CommonModule,
    FuseLoadingBarComponent,
    FuseVerticalNavigationComponent,
    UserComponent,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    FuseFullscreenComponent,
    RouterOutlet,
    MatSelectModule,
    MatFormFieldModule
],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    usuarioId: number;
    lstRoles: UsuarioRolInicialDto[];
    lstMenu: UsuarioMenuDto[];
    frmCabecera: FormGroup;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Constructor
     */
    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private usuarioService: UsuarioService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _authService: AuthService,
        private mensajesService: MensajesService,
        private cdRef: ChangeDetectorRef
    ) {
        this.frmCabecera = this.formBuilder.group({
            IdRol: [0],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.IdRol.setValue(this._authService.accessRolIdGlobal);

        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        this._userService.lstRoles$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((lstRoles: UsuarioRolInicialDto[]) => {

                this.lstRoles = lstRoles;
            });
        this._userService.lstMenu$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                if (navigation == undefined) {
                    this.navigation = {
                        default: null
                    } as Navigation;
                } else {
                    this.navigation = navigation;
                }
            });

        if (this.user == undefined) {

            const vToken: string | null = this.accessToken;
            const decodedToken = AuthUtils._decodeToken(vToken?.toString());
            let vUsuario = {
                id: decodedToken.Id,
                name: `${decodedToken.Nombres} ${decodedToken.ApellidoPaterno} ${decodedToken.ApellidoMaterno}`,
                email: decodedToken.Email,
                //avatar: `/images/avatars/${decodedToken.Id}.jpg`,
                status: 'online',
            } as User;

            // Store the user on the user service
            this._userService.user = vUsuario;
        }

        if ( this.lstRoles == undefined || this.navigation == undefined) {
            //falta codigo aqui
            this.usuarioService.ObtenerRolMenuPorUsuario()
                .subscribe((response) => {
                    if (response.success) {
                        let vData = response.data;

                        this.lstMenu = vData.lstUsuarioMenuDto;

                        this._userService.lstRoles = vData.lstUsuarioRolInicialDto; //this.lstRoles;

                        this._userService.lstMenu = {
                            default: this.buildTree(this.lstMenu, null)
                        } as Navigation;

                    }
                    else {
                        this.lstRoles = [];
                        this.lstMenu = [];
                    }
                    this.mensajesService.msgAutoClose();
                },
                    (error: any) => {
                        const mensaje = environment.mensajesError.noCargaRoles + ' '
                            + environment.mensajesError.sinConexion;
                        this.mensajesService.msgError(mensaje);
                        this.mensajesService.msgAutoClose();
                    });
            // this.seleccionarValidacion();
        }

        // Check authentication and sign in using the token if available
        this._authService.check().subscribe(isAuthenticated => {
            if (!isAuthenticated) {
                this._router.navigate(['/sign-in']);
            }
        });

        this.cdRef.detectChanges();
    }

    buildTree(data: UsuarioMenuDto[], parentId: string | null): FuseNavigationItem[] {
        const nodes: FuseNavigationItem[] = [];
        if (data != undefined)
            data.forEach(node => {
                if (node.IdOrigen === parentId) {
                    /*
                    if (node.Id == "10000001"){
                        const newNodeDivider : FuseNavigationItem = {
                            id: 'divider-' + node.Nombre.trim().toString(),
                            type: "divider"
                        };

                        const children1 = this.buildTree(data, node.Id);
                        if (children1.length) {
                            newNodeDivider.children = children1;
                        }
                        nodes.push(newNodeDivider);
                    }
                    */

                    const newNode: FuseNavigationItem = {
                        id: node.Nombre.trim().toString(),
                        codigo: Number(node.Id),
                        title: node.Nombre,
                        icon: node.Icono,
                        link: node.Ruta,
                        hidden: (item: FuseNavigationItem) => node.Visible === 0,
                        type: (this.lstMenu.filter(objeto => objeto.IdOrigen == node.Id).length > 0) ? "collapsable" : "basic"
                    };



                    const children = this.buildTree(data, node.Id);
                    if (children.length) {
                        newNode.children = children;
                    }

                    nodes.push(newNode);
                }
            });

        return nodes;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                name
            );

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    seleccionarRol() {

        this.mensajesService.msgLoad("Procesando...");

        if (this.IdRol.value != undefined && this.IdRol.value != null && this.IdRol.value > 0) {
            this._authService.accessRolIdGlobal = this.IdRol.value;
            this._authService.accessCodigoRolGlobal = this.lstRoles.find(obj => obj.Id == this.IdRol.value).Codigo;

            this.usuarioService.ObtenerMenuPorRol(this.IdRol.value)
                .subscribe((response) => {
                    if (response.success) {

                        this._authService.accessToken = response.validations[0].message;

                        const helper = new JwtHelperService();
                        const vToken: string | null = this.accessToken;
                        const decodedToken = helper.decodeToken(vToken?.toString());

                        let vUsuario = {
                            id: decodedToken.Id,
                            name: decodedToken.Nombres + " " + decodedToken.ApellidoPaterno + " " + decodedToken.ApellidoMaterno,
                            email: decodedToken.Email,
                            //avatar: `/images/avatars/${decodedToken.Id}.jpg`,
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
                        this._authService._authenticated = true;

                        this.lstMenu = response.data.filter(item => item.Id != "100061");

                        let menuPaths = this.lstMenu.map(x => x.Ruta).filter(x => x !== null && x !== undefined && x !== "").join(';');
                        localStorage.setItem('menuPaths', menuPaths);

                        this._userService.lstMenu = {
                            default: this.buildTree(this.lstMenu, null)
                        } as Navigation;

                        this.router.navigate(['/dashboard']);
                        this.mensajesService.msgAutoClose();
                    }
                    else {
                        this.lstMenu = [];
                        this.mensajesService.msgAutoClose();
                    }
                }, (error: any) => {
                        const mensaje = environment.mensajesError.noCargaMenu + ' '
                            + environment.mensajesError.sinConexion;
                        this.mensajesService.msgError(mensaje);
                        this.mensajesService.msgAutoClose();
                    });

        } else {
            this.lstMenu = [];
            this.mensajesService.msgAutoClose();
        }


    }

    get IdRol() { return this.frmCabecera.get('IdRol') }
}
