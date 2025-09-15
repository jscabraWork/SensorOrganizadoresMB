import { takeUntil } from 'rxjs';
import { Tarifa } from './../../../../../models/tarifa.model';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
  import { TicketDataService } from '../../../../../service/data/ticket-data.service';
import { MisTicketsDto } from '../../../../../models/mistickets.model';
import { MensajeComponent } from '../../../../../mensaje/mensaje.component';

@Component({
  selector: 'app-mis-tickets',
  standalone: true,
  templateUrl: './mis-tickets.component.html',
  styleUrls: ['./mis-tickets.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule
  ]
})
export class MisTicketsComponent implements OnInit {
  cargando: boolean = false;
  mensaje: string = '';
  
  @Input()
  numeroDocumento: string = '';

  misTickets: MisTicketsDto[] = [];

  constructor(
    private ticketService: TicketDataService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.misTickets = [];
    this.cargando = true;
    
    this.ticketService.getMisTicketsByCliente(this.numeroDocumento).subscribe({
      next: (misTickets: MisTicketsDto[]) => {
        this.cargando = false;
        this.misTickets = misTickets;
        console.log(misTickets)
      },
      error: error => {
        this.cargando = false;
        this.openMensaje('Ocurrió un error al cargar los tickets');
      }
    });
  }

  openMensaje(mensajeT: string, openD?: string): void {
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
      },
    });
  }

  enviarQR(ticketId: number): void {
    this.ticketService.enviarQR(ticketId).subscribe({
      next: () => {
        this.openMensaje('QR Enviado a su correo exitosamente. Revise Spam');
      },
      error: (error) => {
        if (error.error?.error) {
          this.openMensaje(error.error.error);
        } else {
          this.openMensaje('Ocurrió un error al enviar el QR');
        }
      }
    });
  }

  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'DISPONIBLE';
      case 1: return 'VENDIDO';
      case 2: return 'RESERVADO';
      case 3: return 'EN PROCESO';
      case 4: return 'NO DISPONIBLE';
      default: return 'DESCONOCIDO';
    }
  }

  getUtilizadoTexto(utilizado: boolean): string {
    return utilizado ? 'Sí' : 'No';
  }

  getUtilizadoColor(utilizado: boolean): string {
    return utilizado ? '#dc3545' : '#28a745'; // Rojo si utilizado, verde si disponible
  }

  getPrecioTotal(tarifa: Tarifa): number {
    return tarifa.precio + tarifa.servicio + tarifa.iva;
  }
}