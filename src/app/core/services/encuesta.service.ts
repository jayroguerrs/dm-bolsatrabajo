import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";
import { EncuestaRequest } from "../interfaces/iEncuesta";

@Injectable({
    providedIn: 'root'
})

export class EncuestaService {

    API_URL: string = environment.apiURL + "/api/Formularios";

    constructor(private http: HttpClient) {
    }

    validarEncuesta(id): Observable<StatusResponse<boolean>> {
        return this.http.get<StatusResponse<boolean>>(`${this.API_URL}/validar/${id}`);
    }

    enviarEncuesta(request: EncuestaRequest): Observable<StatusResponse<boolean>> {
        return this.http.patch<StatusResponse<boolean>>(`${this.API_URL}/enviar`, request);
    }
}
