import { AlternativasDto, PreguntasDto } from "./iPreguntas";

export interface IFormulario {
    Id: number;
    Titulo: string;
    Subtitulo?: string;
    Evento?: string;
    EstadoTexto?: string;
    UsuarioModificacion?: string;
    FechaModificacion: Date;
}

export interface IFormularioInicialDto{
    Id: number;
    Titulo: string;
    Imagen: string;
    Subtitulo: string;
    Evento: number;
    lstPreguntasDto: Array<PreguntasDto>;
    lstAlternativasDto: Array<AlternativasDto>;
}

export interface IFormularioFiltroPaginado {
    EventoId?: number;
    Titulo?: string;
    Fecha?: Date;
    Estado?: number;
    SortColumn?: string;
    SortOrder?: string;
    NumeroPagina: number;
    TamanioPagina: number;
}

export interface IFormularioEli {
    Id: number;
}

export interface IFormularioFiltro {
    Titulo?: string;
    EventoId?: number;
    Estado?: number;
    SortColumn: string;
    SortOrder: string;
}

export interface IFormularioRespuesta {
    FormularioLink: string;
    ListaRespuesta: Array<RespuestaDto>;
}

export interface RespuestaDto {
    PreguntaId: number;
    Respuesta: string;
}
