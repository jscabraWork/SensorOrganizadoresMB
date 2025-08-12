import { Evento } from "./evento.model"
import { Localidad } from "./localidad.model"

export class Dia {
    id: number
    nombre: string
    estado: number
    fechaInicio: string
    fechaFin: string
    horaInicio: string
    horaFin: string
    localidades: Localidad[]
    evento: Evento
}