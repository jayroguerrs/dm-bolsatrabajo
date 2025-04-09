import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";

import { IFormulario, IFormularioEli, IFormularioFiltro, IFormularioFiltroPaginado, IFormularioInicialDto } from "../interfaces/iFormulario";

@Injectable({
    providedIn: 'root'
})

export class FormularioService {

    API_URL: string = environment.apiURL + "/api/formularios";

    constructor(private http: HttpClient) {
    }

    listarPaginado(request: IFormularioFiltroPaginado): Observable<StatusResponse<IFormulario[]>> {
        let params = new HttpParams();
        params = params.append('EventoId', request.EventoId);
        params = params.append('Titulo', request.Titulo);
        params = params.append('Estado', request.Estado);
        //params = params.append('Fecha', request.Fecha.toISOString());
        if (request.SortColumn == undefined) request.SortColumn = '';
        if (request.SortOrder == undefined) request.SortOrder = '';
        params = params.append('NumeroPagina', request.NumeroPagina.toString());
        params = params.append('TamanioPagina', request.TamanioPagina.toString());
        params = params.append('SortColumn', request.SortColumn.toString());
        params = params.append('SortOrder', request.SortOrder.toString());

        return this.http.get<StatusResponse<IFormulario[]>>(`${this.API_URL}/listarPaginado`, { params });
    }

    eliminar(request: IFormularioEli): Observable<StatusResponse<boolean>> {
        return this.http.patch<StatusResponse<boolean>>(`${this.API_URL}/eliminar`, request);
    }

    obtenerDatos(vUrl: string) : Observable<StatusResponse<IFormularioInicialDto>> {
        let params = new HttpParams();
        params = params.append('url', vUrl.toString());
        return this.http.get<StatusResponse<IFormularioInicialDto>>(`${this.API_URL}/ObtenerDatos`, { params });
    }

    enviarFormulario(formData: FormData) : Observable<StatusResponse<boolean>> {
        return this.http.post<StatusResponse<boolean>>(`${this.API_URL}/enviarFormulario`, formData);
    }

    // Método para subir archivos al servidor
    subirArchivo(file: File): Observable<{ ruta: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<{ ruta: string }>(`${this.API_URL}/subir-archivo`, formData);
    }

    /**
     * Descarga Excel o PDF
     * @param tipo 1: Excel, 2:PDF
     */
    generarReporte(request: IFormularioFiltro, tipo: number) {
        let params = new HttpParams();
        params = params.append('EventoId', request.EventoId);
        params = params.append('Titulo', request.Titulo);
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

