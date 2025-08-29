import { Dia } from "./dia.model"
import { Imagen } from "./imagen.model"
import { Organizador } from "./organizador.model"
import { Tipo } from "./tipo.model"
import { Venue } from "./venue.model"

export class Evento {
    id: number
    pulep: string
    artistas: string
    nombre: string
    recomendaciones: string
    descripcion: string
    video: string
    fechaApertura: Date
    estado: number
    venue: Venue
    organizadores: Organizador[]
    dias: Dia[]
    tipo: Tipo
    imagenes: Imagen[]

}