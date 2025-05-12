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

export interface IPostulantesFiltroPaginado {
    NumeroDocumento?: string;
    Nombres?: string;
    PuestoId: number;
    Ubicacion?: string;
    Estado?: number;
    SortColumn: string;
    SortOrder: string;
    NumeroPagina: number;
    TamanioPagina: number;
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

export interface IPostulantesFiltro {
    NumeroDocumento?: string;
    Nombres?: string;
    PuestoId: number;
    Ubicacion?: string;
    Estado: number;
    SortColumn: string;
    SortOrder: string;
}

export interface IPuestos {
    Id?: number;
    Titulo: string;
    Descripcion: string;
    FechaFin: Date;
    FechaIni: Date;
    Ubicacion?: string;
    Distrito?: string;
    Departamento?: string;
    DistritoId?: number;
    DepartamentoId?: number;
    Imagen?: string;
    FechaModificacion: Date;
    UsuarioResponsable: string;
    EstadoTexto: string;
    Estado?: number;
}

export interface IPuestosFiltroPorIdDto {
    Id: number;
}

export interface IPuestosEli {
    Id: number;
}

export interface IPuestosInsUpd {
    Id?: number;
    Titulo: string;
    Descripcion: string;
    FechaInicial: string;
    FechaFinal: string;
    DistritoId: string;
    Estado: number;
}

export interface IPostulantes {
    Id?: number;
    Nombres: string;
    Correo: string;
    Archivo: Date;
    EstadoTexto: string;
    FechaModificacion: Date;
    UsuarioResponsable: string;
}
