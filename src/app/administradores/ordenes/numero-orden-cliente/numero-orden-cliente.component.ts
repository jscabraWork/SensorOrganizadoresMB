import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdenDataService } from '../../../service/data/orden-data.service';
import { Orden } from '../../../models/orden.model';
import { Observable } from 'rxjs';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { EventoDataService } from '../../../service/data/evento-data.service';
import { Evento } from '../../../models/evento.model';
import { TicketDataService } from '../../../service/data/ticket-data.service';
import { Ticket } from '../../../models/ticket.model';
import { Localidad } from '../../../models/localidad.model';

@Component({
  selector: 'app-numero-orden-cliente',
  imports: [
        CommonModule,
        RouterModule,
        FormsModule
      ],
  templateUrl: './numero-orden-cliente.component.html',
  styleUrl: './numero-orden-cliente.component.scss'
})
export class NumeroOrdenClienteComponent implements OnInit {

  idOrden:number
  cargando: boolean;
  selectedTicketItem: number = -1;
  selectedTransaccionItem: number = -1;
  ordenEncontrada = false;
  orden:Orden
  ordenes: Orden[] = [];
  evento:Evento
  idTicket: number;
  agregandoTicket: boolean = false;
  tickets:Ticket[]
  idTarifa:number
  localidad: Localidad;
  constructor(
    private dialog: MatDialog,
    private ordenService: OrdenDataService
  ){}

  ngOnInit(): void {



  }

  toggleTicketItem(index: number) {
    this.selectedTicketItem = this.selectedTicketItem === index ? -1 : index;
  }

  toggleTransaccionItem(index: number) {
    this.selectedTransaccionItem = this.selectedTransaccionItem === index ? -1 : index;
  }

  buscarOrden(){
    if (!this.idOrden) {
      this.openMensaje("Por favor ingresa un número de orden");
      return;
    }
    this.cargando = true
    this.ordenService.getOrdenByIdAdmin(this.idOrden).subscribe({
      next: (response) => {
        this.ordenEncontrada = true;
        this.orden = response.orden;
        this.orden.cliente = response.cliente;
        this.orden.transacciones = response.transacciones;
        this.orden.evento = response.evento;
        this.orden.tickets = response.tickets;
        this.localidad = response.localidad;
        this.cargando = false
      },
      error: (err) => {
        this.openMensaje("No se encontró la orden");
        this.cargando = false
      }
    });
  }




  cambiarEstado(orden:Orden){
    const estadoAnterior = orden?.estado
    this.cargando = true
    this.ordenService.cambiarEstadoOrden(orden).subscribe({
      next: (response) => {
        this.cargando = false
        this.orden = response;
        this.buscarOrden()
        this.openMensaje('Se le cambió el estado a la orden');
      },
      error: (err) => {
        this.cargando = false
        orden.estado = estadoAnterior;
        this.openMensaje('No se pudo cambiar el estado');
      }
    });
  }

  agregarTicket(){
    if (!this.idTicket) {
      this.openMensaje("Por favor ingresa un ID de ticket válido");
      return;
    }
    this.cargando = true;
    this.ordenService.agregarTicketAorden(this.idOrden,this.idTicket).subscribe({
      next: (response) =>{
        this.idTicket = null;
        this.buscarOrden()
        this.cargando=false;
        this.openMensaje("Ticket agregado correctamente");
      },
      error: (err) => {
        if (err.status === 500) {
          this.cargando=false;
          this.openMensaje('No se encontro ningun ticket con el id proporcionado');
      } else {
          this.cargando=false;
          this.openMensaje('Ocurrió un error al agregar el ticket, vuelve a intentar');
      }
      }
    })

  }

  eliminarTicketDeOrden(idTicket: number) {
    if (!idTicket) {
      this.openMensaje("No se proporcionó un ID de ticket válido");
      return;
    }
    this.openMensaje("¿Estás seguro de que quieres eliminar este ticket de la orden?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true;
        this.ordenService.eliminarTicketDeOrden(this.idOrden, idTicket).subscribe({
          next: (response) => {
            this.buscarOrden()
            this.cargando = false;
            this.openMensaje("Ticket eliminado correctamente");
          },
          error: (err) => {
            this.cargando = false;
            this.openMensaje("Error al eliminar el ticket: " + (err.error?.message || err.message));
          }
        });
      }
    });
  }

validacionContraPtp(idOrden: number) {

  this.cargando = true;

  this.ordenService.validarContraPtpTrx(idOrden).subscribe({
    next: (response) => {
      this.cargando = false;
      this.openMensaje("Validacion exitosa");
      this.buscarOrden();
    },
    error: (error) => {
      this.cargando = false;
      this.openMensaje("Sucedio un error por favor validar con el equipo de soporte");
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

  checkMetodo(metodo){
    switch(metodo){
      case 1:
        return "Tarjeta de Credito"
        break;
      case 2:
        return "PSE"
        break;
      case 3:
        return "Datafono"
        break;
      case 4:
        return "Efectivo";
        break;
      case 5:
        return "Transferencia"
        break;
      case 6:
        return "TOKEN TARJETA"
        break;

    }
    return metodo
  }

  checkEstadoTransaccion(estado){
    switch(estado){
      case 4:
        return "Devolución"
        break;
      case 5:
        return "Fraude"
        break;
      case 6:
        return "Upgrade"
        break;
      case 34:
        return "Aceptada"
        break;
      case 35:
        return "Rechazada"
        break;
      case 36:
        return "En Proceso"
        break;
    }
    return estado
  }

  checkEstadoTicket(estado){
    switch(estado){
      case 0:
        return "Disponible"
        break;
      case 1:
        return "Vendido"
        break;
      case 2:
        return "Reservado"
        break;
      case 3:
        return "En Proceso";
        break;
      case 4:
        return "No disponible"
        break;
    }
    return estado
  }

}
