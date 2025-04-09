import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";

import { IPuestos, IPuestosFiltroPaginado, IPuestosFiltro, IPuestosFiltroPorIdDto } from "../interfaces/iPuestos";
import { AuthService } from "../auth/auth.service";

@Injectable({
    providedIn: 'root'
})

export class PuestosService {

    API_URL: string = environment.apiURL + "/api/puestos";

    constructor(private http: HttpClient, private authService: AuthService) {
    }

    listarPaginado(request: IPuestosFiltroPaginado): Observable<StatusResponse<IPuestos[]>> {
        let params = new HttpParams();
        if (request.FechaRegistro) {
            params = params.append('FechaRegistro', request.FechaRegistro.toISOString());
        }
        params = params.append('Estado', request.Estado);
        params = params.append('Ubicacion', request.Ubicacion);
        if (request.SortColumn == undefined) request.SortColumn = '';
        if (request.SortOrder == undefined) request.SortOrder = '';
        params = params.append('NumeroPagina', request.NumeroPagina.toString());
        params = params.append('TamanioPagina', request.TamanioPagina.toString());
        params = params.append('SortColumn', request.SortColumn.toString());
        params = params.append('SortOrder', request.SortOrder.toString());

        return this.http.get<StatusResponse<IPuestos[]>>(`${this.API_URL}/listarPaginado`, { params });
    }

    ObtenerPorId(request: IPuestosFiltroPorIdDto): Observable<StatusResponse<IPuestos>> {
        let params = new HttpParams();
        params = params.append('Id', request.Id.toString());
        return this.http.get<StatusResponse<IPuestos>>(`${this.API_URL}/obtenerPorId`, { params });
    }


    /**
     * Descarga Excel o PDF
     * @param tipo 1: Excel, 2:PDF
     */
    generarReporte(request: IPuestosFiltro, tipo: number) {
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

