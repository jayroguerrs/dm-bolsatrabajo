import { Injectable } from "@angular/core";
import { UserService } from "../user/user.service";
import { Location } from '@angular/common';
import { Observable, isEmpty, map, of } from 'rxjs';
import { ActivatedRouteSnapshot } from "@angular/router";
import { environment } from "../../../environments/environments";

@Injectable({
    providedIn: 'root'
})
export class permisosAccesosService {

    API_URL: string = environment.apiURL + "/api/Menu";

    constructor(
        private location: Location,
        private _userService: UserService,
    ) {
    }

    permiteURL(route: ActivatedRouteSnapshot): Observable<boolean> {

        let tieneObs = false;

        this._userService.lstMenu$.pipe(
            isEmpty()
        ).subscribe(esVacio => {
            tieneObs = !esVacio;
        });

        if (tieneObs) {

            return this._userService.lstMenu$
                .pipe(
                    map(item => {

                        const vCodigo = route.data.codigo;
                        let vExiste = false;
                        // Obtener objeto usuario
                        const itemOriginal = item.default;

                        let itemLista = this.convertirLista(itemOriginal);
                        vExiste = (itemLista.filter(item => item.codigo == vCodigo).length > 0);
                        return vExiste;
                    })
                );
        } else {
            const observable$ = of(false);
            return observable$;
        }
    }

    convertirLista(lista) {
        const items = [];
        lista.forEach(item => {
            items.push(item);
            if (item.children) {
                items.push(...this.convertirLista(item.children))
            }
        });

        return items;
    }
}
