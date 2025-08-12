import { Dia } from "./dia.model"
import { Tarifa } from "./tarifa.model"

export class Localidad {
    id: number
    nombre: string
    aporteMinimo: number
    tipo: number
    descripcion: string
    tarifas: Tarifa[] = []
    dias: Dia[] = []
    estado;
}