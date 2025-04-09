import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";

import { ICatalogo, ICatalogoDetalle, ICatalogoDetalleFiltro, ICatalogoDetalleFiltroPaginado, ICatalogoDetalleRequest } from "../interfaces/iCatalogoDetalle";

@Injectable({
    providedIn: 'root'
})

export class CatalogoDetalleService {

    API_URL: string = environment.apiURL + "/api/CatalogoDetalle";

    constructor(private http: HttpClient) {
    }

    listarTipoDoc(): Observable<StatusResponse<ICatalogoDetalle[]>> {
        return this.http.get<StatusResponse<ICatalogoDetalle[]>>(`${this.API_URL}/listarTipoDocumento`);
    }

    listarEstado(): Observable<StatusResponse<ICatalogoDetalle[]>> {
        return this.http.get<StatusResponse<ICatalogoDetalle[]>>(`${this.API_URL}/listarEstado`);
    }

    listarGenero(): Observable<StatusResponse<ICatalogoDetalle[]>> {
        return this.http.get<StatusResponse<ICatalogoDetalle[]>>(`${this.API_URL}/listarGenero`);
    }

    listarCatalogoCmb(): Observable<StatusResponse<ICatalogo[]>> {
        return this.http.get<StatusResponse<ICatalogo[]>>(`${this.API_URL}/listarCatalogoCmb`);
    }

    listarPaginado(request: ICatalogoDetalleFiltroPaginado): Observable<StatusResponse<ICatalogoDetalle[]>> {
        let params = new HttpParams();
        params = params.append('IdCatalogo', request.IdCatalogo);
        params = params.append('Nombre', request.Nombre);
        params = params.append('Estado', request.Estado);
        if (request.SortColumn == undefined) request.SortColumn = '';
        if (request.SortOrder == undefined) request.SortOrder = '';
        params = params.append('NumeroPagina', request.NumeroPagina.toString());
        params = params.append('TamanioPagina', request.TamanioPagina.toString());
        params = params.append('SortColumn', request.SortColumn.toString());
        params = params.append('SortOrder', request.SortOrder.toString());

        return this.http.get<StatusResponse<ICatalogoDetalle[]>>(`${this.API_URL}/listarPaginado`, { params });
    }

    obtenerPorId(Id : number): Observable<StatusResponse<ICatalogoDetalle>> {
        let params = new HttpParams();
        params = params.append('Id', Id);
        return this.http.get<StatusResponse<ICatalogoDetalle>>(`${this.API_URL}/obtenerPorId`, { params } );
    }

    insertar(request: ICatalogoDetalle): Observable<StatusResponse<ICatalogoDetalle>> {
        return this.http.post<StatusResponse<ICatalogoDetalle>>(`${this.API_URL}/insertar`, request);
    }

    /**
     * Descarga Excel o PDF
     * @param tipo 1: Excel, 2:PDF
     */
    generarReporte(request: ICatalogoDetalleFiltro, tipo: number) {
        let params = new HttpParams();
        params = params.append('IdCatalogo', request.IdCatalogo);
        params = params.append('Nombre', request.Nombre);
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

