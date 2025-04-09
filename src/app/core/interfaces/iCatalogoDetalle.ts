export interface ICatalogoDetalle {
    Id: number;
    Codigo: string;
    Nombre: string;
    IdCatalogo?: string;
    Catalogo?: string;
    Abreviatura?: string;
    Descripcion?: string;
    IdOrigen?: number;
    Ordenamiento?: number;
    Estado?: number;
}

export interface ICatalogo {
    IdCatalogo: number;
    Nombre: string;
    Abreviatura?: string;
    Descripcion?: string;
}

export interface ICatalogoDetalleFiltroPaginado {
    IdCatalogo: number;
    Nombre: string;
    Estado: number;
    SortColumn?: string;
    SortOrder?: string;
    NumeroPagina: number;
    TamanioPagina: number;
}

export interface ICatalogoDetalleRequest {
    IdCatalogo: number;
    IdOrigen?: number;
    Grupo?: string;
}

export interface ICatalogoDetalleFiltro {
    IdCatalogo?: number;
    Nombre?: string;
    Estado?: number;
    SortColumn: string;
    SortOrder: string;
}
