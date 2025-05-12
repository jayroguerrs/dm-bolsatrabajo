export interface IDepartamentoCombo {
    DepaId: number;
    Nombre: string;
}

export interface IDepartamentoFiltroCombo {
    Estado?: number
}

export interface IDistritoCombo {
    DistritoId: number;
    Nombre: string;
}

export interface IDistritoFiltroCombo {
    DepaId: number;
    Estado?: number
}
