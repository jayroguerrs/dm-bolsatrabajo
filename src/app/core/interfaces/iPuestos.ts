export interface IPuestosFiltroPaginado {
    FechaRegistro?: Date;
    Titulo?: string;
    Ubicacion?: string;
    Estado?: number;
    SortColumn: string;
    SortOrder: string;
    NumeroPagina: number;
    TamanioPagina: number;
    RecaptchaToken: string;
}

export interface IPuestosFiltroPaginadoNoCaptcha {
    FechaRegistro?: Date;
    Titulo?: string;
    Ubicacion?: string;
    Estado?: number;
    SortColumn: string;
    SortOrder: string;
    NumeroPagina: number;
    TamanioPagina: number;
}

export interface IPuestosFiltro {
    Usuario: string;
    Sexo: number;
    RolId: number;
    TipoRolId: number;
    Estado: number;
    SortColumn: string;
    SortOrder: string;
}

export interface IPuestos {
    Id?: number;
    Titulo: string;
    Descripcion: string;
    FechaFin: Date;
    Ubicacion?: string;
    Distrito?: string;
    Departamento?: string;
    Imagen?: string;
    FechaModificacion: Date;
    UsuarioResponsable: string;
    EstadoTexto: string;
}

export interface IPuestosFiltroPorIdDto {
    Id: number;
}
