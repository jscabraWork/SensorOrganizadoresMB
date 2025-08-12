import { Tarifa } from './tarifa.model';
import { Generic } from '../service/commons/generic.model';

export class Cupon extends Generic {
    codigo: string;
    vigencia: string;
    cantidadMinima: number;
    cantidadMaxima: number;
    ventaMaxima: number;
    estado: number;
    tarifa: Tarifa;
}