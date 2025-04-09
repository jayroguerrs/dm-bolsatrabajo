import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { User } from '../user/user.types';
import { StatusResponse } from '../services/StatusResponse.model';
import { environment } from 'environments/environments';
import { IClave } from '../interfaces/iSeguridad';
import { UsuarioInicialDto, UsuarioMenuDto } from '../interfaces/iUsuario';
import { Navigation } from '../navigation/navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';

@Injectable({ providedIn: 'root' })
export class AuthService {
    public _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    API_URL: string = environment.apiURL + "/api/seguridad";
    API_URL_USUARIO: string = environment.apiURL + "/api/usuario";
    API_FRONT: string = environment.apiFront + "/reset-password";
    lstMenu: UsuarioMenuDto[] = [];
    //private API_URL = _env.apiSRCTG + "/api/Seguridad";
    //private API_URL_USUARIO = _env.apiSRCTG + "/api/usuario";
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set accessRolIdGlobal(rolId: number) {
        localStorage.setItem('rolGlobal', rolId.toString());
    }

    get accessRolIdGlobal(): number {
        return parseInt(localStorage.getItem('rolGlobal'));
    }

    set accessCodigoRolGlobal(codigoRol: string) {
        localStorage.setItem('codigoRolGlobal', codigoRol);
    }

    get accessCodigoRolGlobal(): string {;
        return localStorage.getItem('codigoRolGlobal');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        let params = new HttpParams();
        params = params.append('email', email);
        params = params.append('url', this.API_FRONT);
        return this._httpClient.get(`${this.API_URL}/solicitarCambioContrasena`, { params }).pipe(
            switchMap((response: any) => {
                if (response.success == true) {
                    let respuesta = {} as StatusResponse<any>;
                    respuesta.success = true;
                    return of(respuesta);
                }
            })
        );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(`${this.API_URL}/IniciarSesion`, credentials).pipe(
            switchMap((response: any) => {
                let respuesta = {} as StatusResponse<any>;
                if (response.success == true) {

                    // Store the access token in the local storage
                    this.accessToken = response.data.toString();

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    const vToken: string | null = this.accessToken;
                    const decodedToken = AuthUtils._decodeToken(vToken?.toString());

                    let vUsuario = {
                        id: decodedToken.Id,
                        name: `${decodedToken.Nombres} ${decodedToken.ApellidoPaterno} ${decodedToken.ApellidoMaterno}`,
                        email: decodedToken.Email,
                        //avatar: `/images/avatars/${decodedToken.Id}.jpg`,
                        status: 'online',
                    } as User;

                    let ojbRespuesta = {
                        accesToken: this.accessToken,
                        tokenType: "bearer",
                        user: vUsuario
                    }

                    respuesta.data = ojbRespuesta;
                    respuesta.success = true;

                    this._userService.user = vUsuario;

                    return of(respuesta);

                } else {
                    respuesta.data = null;
                    respuesta.success = false;

                    return of(respuesta);
                }
            })
        );
    }

    obtenerCargaInicial(idUsuario: number): Observable<StatusResponse<UsuarioInicialDto>> {
        let params = new HttpParams();
        params = params.append('idUsuario', idUsuario.toString());

        return this._httpClient.get<StatusResponse<UsuarioInicialDto>>(`${this.API_URL_USUARIO}/ObtenerCargaInicial`, { params })
            .pipe(
                switchMap((response) => {
                    if (response.success) {
                        // Return a new observable with the response
                        let vUsuario = response.data;

                        this.accessRolIdGlobal = vUsuario.IdRol;
                        this.accessCodigoRolGlobal = vUsuario.CodigoRol;
                        this._userService.lstRoles = vUsuario.lstUsuarioRolInicialDto;

                        this.lstMenu = vUsuario.lstUsuarioMenuDto;

                        let menuPaths = this.lstMenu.map(x => x.Ruta).filter(x => x !== null && x !== undefined && x !== "").join(';');
                        localStorage.setItem('menuPaths', menuPaths);

                        this._userService.lstMenu = {
                            default: this.buildTree(this.lstMenu, null)
                        } as Navigation;

                        return of(response);
                    } else {
                        return of(null);
                    }
                })
            );
    }


    buildTree(data: UsuarioMenuDto[], parentId: string | null): FuseNavigationItem[] {
        const nodes: FuseNavigationItem[] = [];
        if (data != undefined)
            data.forEach(node => {
                if (node.IdOrigen === parentId) {
                    //let visible : boolean = node.Visible === 0 ? true : false;
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
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Decode the token to get the user information
        const decodedToken = AuthUtils._decodeToken(this.accessToken);

        // Construct the user object
        const user: User = {
            id: decodedToken.Id,
            name: `${decodedToken.Nombres} ${decodedToken.ApellidoPaterno} ${decodedToken.ApellidoMaterno}`,
            email: decodedToken.Email,
            //avatar: `/images/avatars/${decodedToken.Id}.jpg`,
            status: 'online',
        };

        // Store the user on the user service
        this._userService.user = user;

        // Set the authenticated flag to true
        this._authenticated = true;

        // Return true
        return of(true);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {

        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    cambiarClave(request: IClave): Observable<StatusResponse<boolean>> {
        return this._httpClient.patch<StatusResponse<boolean>>(`${this.API_URL}/CambiarClave`, request );
    }

    cambiarClaveNoAuth(request: IClave): Observable<StatusResponse<boolean>> {
        return this._httpClient.patch<StatusResponse<boolean>>(`${this.API_URL}/cambiarClaveNoAuth`, request );
    }

    validarURLRestablecer(token: string, Id: number): Observable<StatusResponse<boolean>> {
        let params = new HttpParams();
        params = params.append('Token', token);
        params = params.append('IdUsuario', Id);

        return this._httpClient.get<StatusResponse<boolean>>(`${this.API_URL}/validarCredencialesRestablecer`, { params });
    }
}
