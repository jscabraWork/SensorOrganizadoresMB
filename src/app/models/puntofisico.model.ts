import { Generic } from '../service/commons/generic.model';
import { Evento } from './evento.model';
import { Usuario } from "./usuario.model";

export class PuntoFisico extends Generic{
    nombre: string;
    numeroDocumento: string;
    correo:string;
    celular:string;
    eventos: Evento[] = [];
}
