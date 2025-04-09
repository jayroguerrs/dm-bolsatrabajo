import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";
import { JwtHelperService } from "@auth0/angular-jwt";

import { IUsuario, IUsuarioAsociarRol, IUsuarioDatos, IUsuarioEli, IUsuarioFiltro, IUsuarioFiltroPaginado, IUsuarioRolDatos, IUsuarioRolIns, UsuarioMenuDto, UsuarioRolMenuDto } from "../interfaces/iUsuario";
import { AuthService } from "../auth/auth.service";

@Injectable({
    providedIn: 'root'
})

export class UsuarioService {

    API_URL: string = environment.apiURL + "/api/usuario";
    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    constructor(private http: HttpClient, private authService: AuthService) {
    }

    obtenerDatos(Id): Observable<StatusResponse<IUsuarioDatos>> {;

        let params = new HttpParams();
        params = params.append('id', Id);
        return this.http.get<StatusResponse<IUsuarioDatos>>(`${this.API_URL}/obtenerDatos`, { params });
    }

    obtenerDatosRolUsuario(IdRolUsuario): Observable<StatusResponse<IUsuarioRolDatos>> {;

        let params = new HttpParams();
        params = params.append('idRolUsuario', IdRolUsuario);
        return this.http.get<StatusResponse<IUsuarioRolDatos>>(`${this.API_URL}/obtenerDatosPorRol`, { params });
    }

    actualizarDatos(usuario: IUsuarioDatos): Observable<StatusResponse<boolean>> {
        return this.http.patch<StatusResponse<boolean>>(`${this.API_URL}/actualizarDatos`, usuario);
    }

    asociarRol(usuario: IUsuarioAsociarRol): Observable<StatusResponse<boolean>> {
        return this.http.patch<StatusResponse<boolean>>(`${this.API_URL}/asociarRol`, usuario);
    }

    obtenerIdUsuario(): number {
        const helper = new JwtHelperService();
        const vToken: string | null = this.accessToken;
        const decodedToken = helper.decodeToken(vToken?.toString());
        return decodedToken.Id;
    }

    ObtenerRolMenuPorUsuario(): Observable<StatusResponse<UsuarioRolMenuDto>> {
        ///
        const helper = new JwtHelperService();
        const vToken: string | null = this.accessToken;
        const decodedToken = helper.decodeToken(vToken?.toString());
        const idUsuario = decodedToken.Id;
        const idRol=this.authService.accessRolIdGlobal;

        let params = new HttpParams();
        params = params.append('IdUsuario', idUsuario);
        params = params.append('IdRol', idRol);
        return this.http.get<StatusResponse<UsuarioRolMenuDto>>(`${this.API_URL}/obtenerRolMenuPorUsuario`, { params });
    }

    ObtenerMenuPorRol(idRol: number): Observable<StatusResponse<UsuarioMenuDto[]>> {
        let params = new HttpParams();
        params = params.append('idRol', idRol.toString());
        return this.http.get<StatusResponse<UsuarioMenuDto[]>>(`${this.API_URL}/obtenerMenuPorRol`, { params });
    }

    listarPaginado(request: IUsuarioFiltroPaginado): Observable<StatusResponse<IUsuario[]>> {
        let params = new HttpParams();
        params = params.append('Usuario', request.Usuario);
        params = params.append('Sexo', request.Sexo);
        params = params.append('RolId', request.RolId);
        params = params.append('TipoRolId', request.TipoRolId);
        params = params.append('Estado', request.Estado);
        if (request.SortColumn == undefined) request.SortColumn = '';
        if (request.SortOrder == undefined) request.SortOrder = '';
        params = params.append('NumeroPagina', request.NumeroPagina.toString());
        params = params.append('TamanioPagina', request.TamanioPagina.toString());
        params = params.append('SortColumn', request.SortColumn.toString());
        params = params.append('SortOrder', request.SortOrder.toString());

        return this.http.get<StatusResponse<IUsuario[]>>(`${this.API_URL}/listarPaginado`, { params });
    }

    eliminar(request: IUsuarioEli): Observable<StatusResponse<boolean>> {
        return this.http.patch<StatusResponse<boolean>>(`${this.API_URL}/eliminar`, request);
    }

    insertar(IdRolUsuario: number, request: IUsuarioRolIns): Observable<StatusResponse<boolean>> {
        return this.http.post<StatusResponse<boolean>>(`${this.API_URL}/insertar`, { IdRolUsuario, ...request });
    }

    recuperarContrasenia(usuarioId: number): Observable<StatusResponse<boolean>> {
        return this.http.patch<StatusResponse<boolean>>(`${this.API_URL}/${usuarioId}/recuperarContrasenia`,null);
    }

    /**
     * Descarga Excel o PDF
     * @param tipo 1: Excel, 2:PDF
     */
    generarReporte(request: IUsuarioFiltro, tipo: number) {
        let params = new HttpParams();
        params = params.append('Usuario', request.Usuario);
        params = params.append('Sexo', request.Sexo);
        params = params.append('RolId', request.RolId);
        params = params.append('TipoRolId', request.TipoRolId);
        params = params.append('Estado', request.Estado);
        if (request.SortColumn == undefined) request.SortColumn = '';
        if (request.SortOrder == undefined) request.SortOrder = '';
        params = params.append('SortColumn', request.SortColumn.toString());
        params = params.append('SortOrder', request.SortOrder.toString());
        params = params.append('Tipo', tipo.toString());


        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            responseType: 'blob' as 'json' // Para recibir la respuesta como un archivo blob
        };

        return this.http.get(`${this.API_URL}/generarReporte`, { params, ...httpOptions });
    }
}

