import { Evento } from "./evento.model"
import { Localidad } from "./localidad.model"

export class Tarifa {
    id: number
    nombre: string
    precio: number
    servicio: number
    iva: number
    estado: number
    localidad?: Localidad
}