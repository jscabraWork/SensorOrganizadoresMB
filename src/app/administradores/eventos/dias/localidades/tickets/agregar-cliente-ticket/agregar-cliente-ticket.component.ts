import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Cliente } from '../../../../../../models/cliente.model';
import { Ticket } from '../../../../../../models/ticket.model';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UsuarioDataService } from '../../../../../../service/data/usuario-data.service';
import { TicketDataService } from '../../../../../../service/data/ticket-data.service';
import { MensajeComponent } from '../../../../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { Usuario } from '../../../../../../service/usuario.model';

@Component({
  selector: 'app-agregar-cliente-ticket',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './agregar-cliente-ticket.component.html',
  styleUrl: './agregar-cliente-ticket.component.scss'
})
export class AgregarClienteTicketComponent implements OnInit {
  @ViewChild('todoForm') todoForm: NgForm;
  clienteNuevo: Cliente
  ticket: Ticket
  numeroDocumento: string
  cargando: boolean

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usuarioService: UsuarioDataService,
    private dialog: MatDialog,
    private ticketService: TicketDataService
  ) { }

  ngOnInit(): void {
    this.clienteNuevo = new Cliente()
    this.ticket = this.data.ticket
    this.cargando = false
  }

  buscarCliente() {
  this.cargando = true;
  this.usuarioService.buscarPorNumeroDocumento(this.numeroDocumento).subscribe({
    next: (response: any) => {
      this.cargando = false;
      this.clienteNuevo = new Cliente();
      this.clienteNuevo.nombre = response.cliente.nombre;
      this.clienteNuevo.numeroDocumento = response.cliente.numeroDocumento;
      this.clienteNuevo.correo = response.cliente.correo;
      this.clienteNuevo.celular = response.cliente.celular;
    },
    error: (err) => {
      this.cargando = false;
      if (err.status === 404) {
        this.openMensaje('No se encuentra registrado el número de documento ingresado');
      } else {
        this.openMensaje('Ocurrió un error al buscar el cliente');
      }
    }
  });
}

  asignarCliente() {
    if (this.clienteNuevo == null || this.clienteNuevo.numeroDocumento == null) {
      this.openMensaje('Busca un usuario registrado');
    }
    else {
      if (this.cargando == false) {
        this.cargando = true
        this.ticketService.asignarClienteAlTicket(this.ticket, this.clienteNuevo).subscribe({
          next: response => {
            response;
            this.cargando = false
            this.openMensaje(response.mensaje);
            this.openMensaje(response.mensaje).subscribe(() => {
              this.cerrarDialogo();
            });
          },
          error: error => {
            this.cargando = false
            this.openMensaje(error.error.message);
          }
        }
        )
      }
    }
  }

  cerrarDialogo() {
    this.dialog.closeAll();
  }

  onEnterPressed() {
  if (this.todoForm.valid) { // Asegúrate de que el formulario es válido
    this.buscarCliente();
  }
}
  openMensaje(mensajeT: string, confirmacion: boolean = false): Observable<Boolean> {
    let screenWidth = screen.width;
    let anchoDialog: string = '500px';
    let anchomax: string = '80vw';
    let altoDialog: string = '250';
    if (screenWidth <= 600) {
      anchoDialog = '100%';
      anchomax = '100%';
      altoDialog = 'auto';
    }
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: anchoDialog,
      maxWidth: anchomax,
      height: altoDialog,
      data: {
        mensaje: mensajeT,
        mostrarBotones: confirmacion

      }
    });
    return dialogRef.afterClosed();
  }

}
