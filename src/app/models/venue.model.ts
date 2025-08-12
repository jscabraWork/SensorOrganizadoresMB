import { Ciudad } from "./ciudad.model"
import { Evento } from "./evento.model"

export class Venue {
    id: number
    nombre: string
    urlMapa: string
    ciudad: Ciudad
    aforo: number;
    eventos: Evento[] = []
}
