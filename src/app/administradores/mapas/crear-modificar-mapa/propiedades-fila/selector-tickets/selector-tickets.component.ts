import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ticket } from '../../../../../models/ticket.model';
import { Localidad } from '../../../../../models/localidad.model';
import { Evento } from '../../../../../models/evento.model';
import { MapasDataService } from '../../../../../service/data/mapas-data.service';

@Component({
  selector: 'app-selector-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-tickets.component.html',
  styleUrls: ['./selector-tickets.component.scss']
})
export class SelectorTicketsComponent implements OnInit {
  @Input() evento: Evento | null = null;
  @Input() visible: boolean = false;
  @Output() ticketsSeleccionados = new EventEmitter<Ticket[]>();
  @Output() cerrar = new EventEmitter<void>();

  localidades: Localidad[] = [];
  localidadSeleccionada: Localidad | null = null;
  tickets: Ticket[] = [];
  ticketsSeleccionadosIds: Set<number> = new Set();

  cargandoLocalidades = false;
  cargandoTickets = false;

  constructor(private mapasDataService: MapasDataService) {}
  
  // Estados de tickets
  readonly ESTADOS = {
    DISPONIBLE: 0,
    VENDIDO: 1,
    RESERVADO: 2,
    EN_PROCESO: 3,
    NO_DISPONIBLE: 4
  };

  // Agrupación de tickets por estado
  ticketsPorEstado: { [key: number]: Ticket[] } = {};

  ngOnInit() {
    if (this.evento) {
      this.cargarLocalidades();
    }
  }

  ngOnChanges() {
    if (this.evento) {
      this.cargarLocalidades();
    }
  }
  cargarLocalidades() {
    if (!this.evento || !this.evento.id) {
      console.warn('No hay evento seleccionado para cargar localidades');
      return;
    }

    this.cargandoLocalidades = true;
    this.mapasDataService.getLocalidadesByEvento(this.evento.id).subscribe({
      next: (localidades: Localidad[]) => {
        this.localidades = localidades;
        this.cargandoLocalidades = false;
      },
      error: (error) => {
        console.error('Error al cargar localidades:', error);
        this.cargandoLocalidades = false;
        // Fallback a datos del evento si el servicio falla
        if (this.evento && this.evento.dias && this.evento.dias.length > 0) {
          this.localidades = this.evento.dias[0].localidades || [];
        }
      }
    });
  }

  onLocalidadChange() {
    if (this.localidadSeleccionada) {
      this.cargarTicketsDeLocalidad();
    } else {
      this.tickets = [];
      this.agruparTicketsPorEstado();
    }
  }
  cargarTicketsDeLocalidad() {
    if (!this.localidadSeleccionada || !this.localidadSeleccionada.id) {
      console.warn('No hay localidad seleccionada para cargar tickets');
      return;
    }

    this.cargandoTickets = true;
    this.mapasDataService.getTicketsByLocalidad(this.localidadSeleccionada.id).subscribe({
      next: (tickets: Ticket[]) => {
        this.tickets = tickets;
        this.agruparTicketsPorEstado();
        this.cargandoTickets = false;
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.cargandoTickets = false;
      }
    });
  }

  agruparTicketsPorEstado() {
    this.ticketsPorEstado = {};
    for (let estado = 0; estado <= 4; estado++) {
      this.ticketsPorEstado[estado] = this.tickets.filter(ticket => ticket.estado === estado);
    }
  }

  obtenerNombreEstado(estado: number): string {
    switch (estado) {
      case this.ESTADOS.DISPONIBLE: return 'Disponible';
      case this.ESTADOS.VENDIDO: return 'Vendido';
      case this.ESTADOS.RESERVADO: return 'Reservado';
      case this.ESTADOS.EN_PROCESO: return 'En Proceso';
      case this.ESTADOS.NO_DISPONIBLE: return 'No Disponible';
      default: return 'Desconocido';
    }
  }

  obtenerColorEstado(estado: number): string {
    switch (estado) {
      case this.ESTADOS.DISPONIBLE: return '#28a745';
      case this.ESTADOS.VENDIDO: return '#dc3545';
      case this.ESTADOS.RESERVADO: return '#ffc107';
      case this.ESTADOS.EN_PROCESO: return '#17a2b8';
      case this.ESTADOS.NO_DISPONIBLE: return '#6c757d';
      default: return '#343a40';
    }
  }

  toggleTicketSeleccion(ticket: Ticket) {
    if (this.ticketsSeleccionadosIds.has(ticket.id)) {
      this.ticketsSeleccionadosIds.delete(ticket.id);
    } else {
      this.ticketsSeleccionadosIds.add(ticket.id);
    }
  }

  seleccionarTodosDeEstado(estado: number) {
    const ticketsEstado = this.ticketsPorEstado[estado] || [];
    ticketsEstado.forEach(ticket => {
      this.ticketsSeleccionadosIds.add(ticket.id);
    });
  }

  deseleccionarTodosDeEstado(estado: number) {
    const ticketsEstado = this.ticketsPorEstado[estado] || [];
    ticketsEstado.forEach(ticket => {
      this.ticketsSeleccionadosIds.delete(ticket.id);
    });
  }

  confirmarSeleccion() {
    const ticketsSeleccionados = this.tickets.filter(ticket => 
      this.ticketsSeleccionadosIds.has(ticket.id)
    );
    this.ticketsSeleccionados.emit(ticketsSeleccionados);
    this.cerrarModal();
  }

  cerrarModal() {
    this.visible = false;
    this.ticketsSeleccionadosIds.clear();
    this.cerrar.emit();
  }

}
