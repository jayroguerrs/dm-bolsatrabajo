import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";

import { IEventoCombo, IEventoFiltroCombo } from "../interfaces/iEvento";

@Injectable({
    providedIn: 'root'
})

export class EventoService {

    API_URL: string = environment.apiURL + "/api/evento";

    constructor(private http: HttpClient) {
    }

    listarCmb(request: IEventoFiltroCombo): Observable<StatusResponse<IEventoCombo[]>> {
        return this.http.post<StatusResponse<IEventoCombo[]>>(`${this.API_URL}/listarCmb`, request);
    }
}

