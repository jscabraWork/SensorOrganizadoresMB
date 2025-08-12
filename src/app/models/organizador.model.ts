import { Evento } from "./evento.model"

export class Organizador {
    numeroDocumento: string
    usuario: string
    nombre: string
    correo: string
    celular: string
    tipoDocumento: number
    eventos: Evento[]
}