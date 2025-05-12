import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";

import { IEventoCombo, IEventoFiltroCombo } from "../interfaces/iEvento";
import { IDepartamentoCombo, IDepartamentoFiltroCombo, IDistritoCombo, IDistritoFiltroCombo } from "../interfaces/iUbicacion";

@Injectable({
    providedIn: 'root'
})

export class UbicacionService {

    API_URL: string = environment.apiURL + "/api/ubicacion";

    constructor(private http: HttpClient) {
    }

    listarDistrito(request: IDistritoFiltroCombo): Observable<StatusResponse<IDistritoCombo[]>> {
        return this.http.post<StatusResponse<IDistritoCombo[]>>(`${this.API_URL}/listarDistritoCmb`, request);
    }

    listarDepartamento(request: IDepartamentoFiltroCombo): Observable<StatusResponse<IDepartamentoCombo[]>> {
        return this.http.post<StatusResponse<IDepartamentoCombo[]>>(`${this.API_URL}/listarDepartamentoCmb`, request);
    }
}

