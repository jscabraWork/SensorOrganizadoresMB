import { Role } from "../models/rol.model";
import { TipoDocumento } from "../models/tipo-documento.model";

export class Usuario {
    nombre: string = '';
    numeroDocumento: string = '';
    tipoDocumento: TipoDocumento;
    usuario: string = '';
    correo:string = '';
    contrasena: string = '';
    celular:string = '';
    tipo: string = '';
    roles: string[] = [];
    enabled:boolean
}