
export interface UsuarioInicialDto {

    Id: number;
    IdRol: number;
    CodigoRol: string;
    avatar: number;
    lstUsuarioRolInicialDto: Array<UsuarioRolInicialDto>;
    lstUsuarioMenuDto: Array<UsuarioMenuDto>;
}

export interface UsuarioRolInicialDto {
    Id: number;
    Codigo: string;
    Nombre: string;
}

export interface UsuarioMenuDto {
    Id: string;
    Nombre: string;
    IdOrigen: string;
    Ordenamiento: number;
    Ruta: string;
    Icono: string;
    Visible: number;
}

export interface IUsuarioDatos {
    Id: number;
    Nombres: string;
    Codigo?: string;
    FechaNacimiento: Date;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    TipoDocumento: number;
    Sexo: number;
    NumeroDocumento: string;
    Email: string;
    Telefono: string;
    Bio: string;
}

export interface IUsuarioRolDatos {
    IdRolUsuario: number;
    Codigo: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    Nombres: string;
    Estado: number;
    Correo: string;
    RolId: number;
}

export interface UsuarioRolMenuDto {
    lstUsuarioRolInicialDto: Array<UsuarioRolInicialDto>;
    lstUsuarioMenuDto: Array<UsuarioMenuDto>;
}

export interface IUsuarioFiltroPaginado {
    Usuario: string;
    Sexo: number;
    RolId: number;
    TipoRolId: number;
    Estado: number;
    SortColumn: string;
    SortOrder: string;
    NumeroPagina: number;
    TamanioPagina: number;
}

export interface IUsuarioFiltro {
    Usuario: string;
    Sexo: number;
    RolId: number;
    TipoRolId: number;
    Estado: number;
    SortColumn: string;
    SortOrder: string;
}

export interface IUsuario {
    Id: number;
    Nombres: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    TipoDocumento: number;
    NumeroDocumento: string;
    Email: string;
    Telefono: string;
    Sexo: string;
    Avatar: string;
    Estado: number;
    EstadoTexto: string;
    RolId: number;
    TipoRolId: number;
    CodigoRol: string;
    CodigoTipoRol: string;
    FechaNacimiento: Date;
    FechaCreacion: Date;
    FechaModificacion: Date;
    UsuarioCreacion: string;
    UsuarioModificacion: string;
}

export interface IUsuarioEli {
    Id: number;
}

export interface IUsuarioRolIns {
    Codigo: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    Nombres: string;
    Estado: number;
    Correo: string;
    RolId: number;
}

export interface IUsuarioAsociarRol {
    IdRolUsuario: number;
    RolId: number;
}
