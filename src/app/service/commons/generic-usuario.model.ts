import { TipoDocumento } from "../../models/tipo-documento.model";

export interface GenericUsuario{
    nombre: string;
    numeroDocumento: string;
    tipoDocumento: TipoDocumento;
    correo:string;
    contrasena: string;
    celular:string;
    enabled:boolean
}