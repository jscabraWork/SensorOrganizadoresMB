import { Directive, OnInit } from '@angular/core';

import { CommonDataService } from '../../service/commons/common-data.service';
import { Generic } from '../../service/commons/generic.model';
import { Observable } from 'rxjs';
import { MensajeComponent } from '../../mensaje/mensaje.component';
import { MatDialog } from '@angular/material/dialog';


@Directive()
export abstract class CommonListarComponent <E extends Generic,S extends CommonDataService<E>> implements OnInit{


  lista:E[]
  protected id;
  protected message;
  cargando: boolean = false;

  constructor(
    protected service: S,
    protected dialog: MatDialog
  ) { }


  ngOnInit(): void {  
    this.lista=[]
    this.refrescar()
  }

  refrescar(){

    this.cargando = true

    this.service.listarPorAtributo(this.id).subscribe({next:response=>{     
      this.cargando = false
      this.manejar(response)
    },error:error=>{
      this.cargando = false
      this.mensaje("Sucedio un error por favor vuelve a intentar")
    }})
  }
  
  manejar(response){
    this.lista = response.lista
    console.log("Respuesta:", response);
  }

  delete(id: any): void {
  this.mensaje("¿Está seguro de que desea eliminar?", true).subscribe({
    next: (confirmado: boolean) => {
      if (confirmado) {
        this.service.delete(id).subscribe({
          next: response => {
            this.refrescar();
            this.message = "Se borró exitosamente " + id;
            this.mensaje("Se eliminó correctamente el recurso");
          },
          error: error => {
            this.mensaje("Sucedió un error, por favor vuelve a intentar");
          }
        });
      } else {
        this.mensaje("No se realizó el borrado");
      }
    },
    error: error => {
      // En caso de que haya algún error con el diálogo mismo
      console.error("Error al mostrar diálogo de confirmación:", error);
    }
  });
}


  mensaje(mensajeT:string, confirmacion: boolean = false): Observable<Boolean> {
            let screenWidth = screen.width;
            let anchoDialog:string = '500px';
            let anchomax:string = '80vw';
            let altoDialog:string = '250';
            
            const dialogRef = this.dialog.open(MensajeComponent, {
              width: anchoDialog,
              maxWidth: anchomax,
              height: altoDialog,
              data:{
                mensaje:mensajeT,
                mostrarBotones: confirmacion
              }
            });
            return dialogRef.afterClosed();
          }
  
}
