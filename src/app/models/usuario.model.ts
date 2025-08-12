import { Role } from "./rol.model";
import { TipoDocumento } from "./tipo-documento.model";

export class Usuario {
    
    nombre: string;
    
    numeroDocumento: string;
        
    correo:string;
        
    celular:string;
    
    tipoDocumento: TipoDocumento;
    
    contrasena: string;

    enabled:boolean;
    
    roles: Role[] = []

   simplificado:boolean;
}
