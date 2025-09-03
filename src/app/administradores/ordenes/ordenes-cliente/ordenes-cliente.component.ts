import { Component, OnInit } from '@angular/core';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OrdenDataService } from '../../../service/data/orden-data.service';
import { Orden } from '../../../models/orden.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ordenes-cliente',
  imports: [
          CommonModule,
          RouterModule,
          FormsModule
        ],
  templateUrl: './ordenes-cliente.component.html',
  styleUrl: './ordenes-cliente.component.scss'
})
export class OrdenesClienteComponent implements OnInit {

    clienteId:string
    cargando: boolean;
    selectedTicketItem: number = -1;
    selectedTransaccionItem: number = -1;
    ordenesEncontradas = false;
    orden:Orden
    ordenes: Orden[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private ordenService: OrdenDataService
  ){}


  ngOnInit(): void {

  }

toggleTicketItem(index: number) {
    this.selectedTicketItem = this.selectedTicketItem === index ? -1 : index;
  }

  buscarOrdenesPorClienteId(){
    if (!this.clienteId) {
      this.openMensaje("Por favor ingresa el numero de documento del cliente");
      return;
    }
    this.cargando = true
    this.ordenService.ordenesPorClienteId(this.clienteId).subscribe({
      next: (response) => {
        this.ordenesEncontradas = true;
        this.ordenes = response.ordenes
        console.log(this.ordenes)
        this.cargando = false
      },
      error: (err) => {
        this.openMensaje("No se encontraron las ordenes de ese cliente");
        this.cargando = false
      }
    });
  }

  openMensaje(mensajeT:string, confirmacion: boolean = false): Observable<Boolean> {
        let screenWidth = screen.width;
        let anchoDialog:string = '500px';
        let anchomax:string = '80vw';
        let altoDialog:string = '250';
        if(screenWidth<=600){
          anchoDialog = '100%';
          anchomax = '100%';
          altoDialog = 'auto';
        }
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

      checkEstado(estado){
    switch(estado){
      case 1:
        return "Aprobada"
        break;
      case 2:
        return "Rechazada"
        break;
      case 3:
        return "En Proceso"
        break;
      case 4:
        return "Devolución"
        break;
      case 5:
        return "Fraude"
        break;
      case 6:
        return "Upgrade"
        break;
    }
    return estado
  }

  checktipo(tipo){
    switch(tipo){
      case 1:
        return "Compra estandar"
        break;
      case 2:
        return "Adiciones"
        break;
      case 3:
        return "Creación de alcancía"
        break;
      case 4:
        return "Aporte a alcancía"
        break;
      case 5:
        return "Traspaso"
        break;
      case 6:
        return "Asignación"
        break;
    }
    return tipo
  }

}
