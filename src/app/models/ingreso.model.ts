import { Dia } from "./dia.model"
import { Ticket } from "./ticket.model"

export class Ingreso {
    id: number
    fechaIngreso: Date
    utilizada: boolean
    dia: Dia
    ticket: Ticket
}