import { Injectable } from "@angular/core";
import "@angular/localize";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { Subject } from "rxjs";

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
    changes = new Subject<void>();

    // For internationalization, the `$localize` function from
    // the `@angular/localize` package can be used.
    firstPageLabel = "Primera página";
    itemsPerPageLabel = "Registros por página:";
    lastPageLabel = "Última página";

    // You can set labels to an arbitrary string too, or dynamically compute
    // it through other third-party internationalization libraries.
    nextPageLabel = 'Página siguiente';
    previousPageLabel = 'Página anterior';

    getRangeLabel(page: number, pageSize: number, length: number): string {
        if (length === 0) {
            return "Página 1 de 1 | Total de 0 registros";
        }
        const amountPages = Math.ceil(length / pageSize);
        return $localize`Página ${page + 1} de ${amountPages} | Total de ${length} registros`;
    }
}
