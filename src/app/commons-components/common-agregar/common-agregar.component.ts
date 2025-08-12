import {  Directive, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Generic } from '../../service/commons/generic.model';
import { CommonDataService } from '../../service/commons/common-data.service';
import { MensajeComponent } from '../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';


@Directive()
export abstract class CommonAgregarComponent<E extends Generic,S extends CommonDataService<E>> implements OnInit{

  protected e:E;
  protected id;
  protected ruta:string;
  constructor(protected service: S, protected router: Router, protected dialog: MatDialog) { }

  ngOnInit(): void {
      
    if(this.id){
      this.service.getPorId(this.id).subscribe({next:response=>{
        this.e = response
      },error:error=>{
        this.mensaje("Error, no se peude obtener la informacion" +error)
      }})
    }
  }


  save(){
    if(this.id){
      this.service.editar(this.e).subscribe({next:response=>{
        response
        this.mensaje(`Se modifico`)
        this.router.navigate([this.ruta])
      },error:error=>{
        error
        this.mensaje("Error vuelva a intentar")
      }})
    }
    
    else{
      this.service.crear(this.e).subscribe({next:response=>{
        this.mensaje(`Se creo`)
        this.router.navigate([this.ruta])
      },error:error=>{
        error
        this.mensaje("Error vuelva a intentar")
      }})
    }
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
