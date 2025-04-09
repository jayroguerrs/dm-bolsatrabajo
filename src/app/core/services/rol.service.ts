import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";

import { IRolCombo, IRolFiltroCombo } from "../interfaces/iRol";

@Injectable({
    providedIn: 'root'
})

export class RolService {

    API_URL: string = environment.apiURL + "/api/rol";

    constructor(private http: HttpClient) {
    }

    listarCmb(request: IRolFiltroCombo): Observable<StatusResponse<IRolCombo[]>> {
        return this.http.post<StatusResponse<IRolCombo[]>>(`${this.API_URL}/listarCmb`, request);
    }
}

