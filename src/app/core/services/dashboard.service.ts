import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environments";
import { Observable } from "rxjs";
import { StatusResponse } from "./StatusResponse.model";
import { IDashboard } from "../interfaces/iDashboard";

@Injectable({
    providedIn: 'root'
})

export class DashboardService {

    API_URL: string = environment.apiURL + "/api/dashboard";

    constructor(private http: HttpClient) {
    }

    obtenerURL(): Observable<StatusResponse<IDashboard[]>> {

        return this.http.post<StatusResponse<IDashboard[]>>(`${this.API_URL}/obtenerURL`, {});
    }

}

