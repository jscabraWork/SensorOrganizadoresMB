import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlcanciasDataService } from '../../../service/data/alcancias-data.service';
import { Alcancia } from '../../../models/alcancia.model';
import { Observable } from 'rxjs';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { Cliente } from '../../../models/cliente.model';
import { Ticket } from '../../../models/ticket.model';
import { Evento } from '../../../models/evento.model';
import { Localidad } from '../../../models/localidad.model';

@Component({
  selector: 'app-alcancia',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './alcancia.component.html',
  styleUrl: './alcancia.component.scss'
})
export class AlcanciaComponent implements OnInit {

  idAlcancia: number;
  cargando: boolean = false;
  alcanciaEncontrada = false;
  selectedTicketItem: number = -1;
  
  // Datos de la alcancía
  alcancia: Alcancia= null;
  cliente: Cliente = null;
  tickets: Ticket[] = [];
  evento: Evento = null;
  localidad: Localidad = null;
  
  // Para agregar tickets
  idTicket: number;
  valorAporte: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private alcanciasService: AlcanciasDataService
  ) { }

  ngOnInit(): void {
    // Componente inicia sin cargar datos
  }

  toggleTicketItem(index: number) {
    this.selectedTicketItem = this.selectedTicketItem === index ? -1 : index;
  }

  buscarAlcancia(): void {
    if (!this.idAlcancia) {
      this.openMensaje("Por favor ingresa un ID de alcancía válido");
      return;
    }
    
    this.cargando = true;
    
    this.alcanciasService.getByIdParaAdmin(this.idAlcancia).subscribe({
      next: (response: any) => {
        this.alcanciaEncontrada = true;
        this.cliente = response.cliente;
        this.tickets = response.tickets || [];
        this.evento = response.evento;
        this.localidad = response.localidad;
        this.alcancia = response.alcancia;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error buscando alcancía:', error);
        this.openMensaje("No se encontró la alcancía especificada");
        this.alcanciaEncontrada = false;
        this.cargando = false;
      }
    });
  }

  aportarDinero(): void {
    if (!this.valorAporte || this.valorAporte <= 0) {
      this.openMensaje("Por favor ingresa un valor válido para aportar");
      return;
    }
    
    this.cargando = true;
    
    this.alcanciasService.aportarAlcanciaAdmin(this.idAlcancia, this.valorAporte).subscribe({
      next: (response: any) => {
        this.valorAporte = null;
        this.buscarAlcancia(); // Recargar datos
        this.openMensaje("Aporte realizado correctamente");
      },
      error: (error) => {
        console.error('Error aportando:', error);
        this.cargando = false;
        this.openMensaje("Error al realizar el aporte");
      }
    });
  }

  agregarTicket(): void {
    if (!this.idTicket) {
      this.openMensaje("Por favor ingresa un ID de ticket válido");
      return;
    }
    
    this.cargando = true;
    
    this.alcanciasService.agregarTicket(this.idAlcancia, this.idTicket).subscribe({
      next: (response: any) => {
        this.idTicket = null;
        this.buscarAlcancia(); // Recargar datos
        this.openMensaje("Ticket agregado correctamente");
      },
      error: (error) => {
        console.error('Error agregando ticket:', error);
        this.cargando = false;
        this.openMensaje("Error al agregar el ticket");
      }
    });
  }

  eliminarTicket(ticketId: number): void {
    if (!ticketId) {
      this.openMensaje("No se proporcionó un ID de ticket válido");
      return;
    }
    
    this.openMensaje("¿Estás seguro de que quieres eliminar este ticket de la alcancía?", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true;
        
        this.alcanciasService.eliminarTicket(this.idAlcancia, ticketId).subscribe({
          next: (response: any) => {
            this.buscarAlcancia(); // Recargar datos
            this.openMensaje("Ticket eliminado correctamente");
          },
          error: (error) => {
            console.error('Error eliminando ticket:', error);
            this.cargando = false;
            this.openMensaje("Error al eliminar el ticket");
          }
        });
      }
    });
  }

  devolverAlcancia(): void {
    if (!this.idAlcancia) {
      this.openMensaje("No se encontró un ID de alcancía válido");
      return;
    }
    
    this.openMensaje("¿Estás seguro de que quieres devolver esta alcancía? Esta acción no se puede deshacer.", true).subscribe(confirmado => {
      if (confirmado) {
        this.cargando = true;
        
        this.alcanciasService.devolver(this.idAlcancia).subscribe({
          next: (response: any) => {
            this.buscarAlcancia(); // Recargar datos
            this.openMensaje("Alcancía devuelta correctamente");
          },
          error: (error) => {
            console.error('Error devolviendo alcancía:', error);
            this.cargando = false;
            this.openMensaje("Error al devolver la alcancía");
          }
        });
      }
    });
  }

  checkEstadoTicket(estado: number): string {
    switch(estado) {
      case 0:
        return "Disponible";
      case 1:
        return "Vendido";
      case 2:
        return "Reservado";
      case 3:
        return "En Proceso";
      case 4:
        return "No disponible";
      default:
        return estado?.toString() || 'Sin definir';
    }
  }

  checkEstadoAlcancia(estado: number): string {
    switch(estado) {
      case 0:
        return "Pagada";
      case 1:
        return "Abierta";
      case 2:
        return "Devuelta";
      default:
        return estado?.toString() || 'Sin definir';
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