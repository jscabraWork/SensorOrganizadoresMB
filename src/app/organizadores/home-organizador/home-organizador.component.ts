import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReporteDataService } from '../../service/data/reporte-data.service';
import { BaseComponent } from '../../commons-ui/base.component';
import { Evento } from '../../models/evento.model';
import { EstadisticasCardsComponent, EstadisticaCard } from '../iu/estadisticas-cards/estadisticas-cards.component';
import { FormsModule } from '@angular/forms';
import { ResumenOrganizador } from './resumen-organizador';

@Component({
  selector: 'app-home-organizador',
  standalone: true,
  imports: [CommonModule, EstadisticasCardsComponent, FormsModule],
  templateUrl: './home-organizador.component.html',
  styleUrl: './home-organizador.component.scss'
})
export class HomeOrganizadorComponent extends BaseComponent implements OnInit {
  
  resumenData: ResumenOrganizador | null = null;
  eventosProximos: Evento[] = [];
  estadisticasPills: EstadisticaCard[] = [];
  idOrganizador: string = '';
  nombreOrganizador: string = '';
  
  // Filtros de fecha opcionales
  fechaInicio?: string;
  fechaFin?: string;

  constructor(
    protected override dialog: MatDialog,
    protected override route: ActivatedRoute,
    private reporteService: ReporteDataService,
    private router: Router
  ) {
    super(dialog, route);
    this.pathVariableName = 'idOrganizador';
  }

  override ngOnInit(): void {
    this.inicializarFechasPorDefecto();
    super.ngOnInit();
  }

  protected override onPathVariableChanged(value: string | null): void {
    if (value) {
      this.idOrganizador = value;
      this.cargarDatos();
    }
  }

  protected override cargarDatos(): void {
    if (this.idOrganizador) {
      this.cargarResumenOrganizador();
    }
  }

  private inicializarFechasPorDefecto(): void {
    const currentYear = new Date().getFullYear();
    this.fechaInicio = `${currentYear}-01-01`;
    this.fechaFin = `${currentYear}-12-31`;
  }

  cargarResumenOrganizador(): void {
    this.iniciarCarga();
    
    this.reporteService.getReseumenGeneralOrganizador(
      this.idOrganizador,
      this.fechaInicio,
      this.fechaFin
    )
    .subscribe({
      next: (response) => {
        this.resumenData = response.resumen;
        this.eventosProximos = response.eventos || [];
        this.nombreOrganizador = response.resumen?.organizador || 'Organizador';
        this.procesarEstadisticasPills();
        this.finalizarCarga();
      },
      error: (error) => {
        this.manejarError(error, 'Error al cargar resumen del organizador');
      }
    });
  }

  private procesarEstadisticasPills(): void {
    if (!this.resumenData) return;
    
    this.estadisticasPills = [
      {
        titulo: 'Eventos',
        valor: this.resumenData.totalEventos || 0,
        tipo: 'primary'
      },
      {
        titulo: 'Compradores',
        valor: this.resumenData.totalCompradoresUnicos || 0,
        tipo: 'default'
      },
      {
        titulo: 'Transacciones',
        valor: this.resumenData.totalTransaccionesProcesadas || 0,
        tipo: 'default'
      },
      {
        titulo: 'Total Asistentes',
        valor: this.resumenData.totalAsistentes || 0,
        tipo: 'highlight'
      }
    ];
  }

  getImagenPrincipal(evento: Evento): string | null {
    if (!evento.imagenes || evento.imagenes.length === 0) {
      return null;
    }
    const imagenPrincipal = evento.imagenes.find(imagen => imagen.tipo === 1);
    return imagenPrincipal?.url || null;
  }

  formatFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) return 'Fecha no disponible';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return isNaN(fechaObj.getTime()) ? 'Fecha no disponible' : fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatHora(fecha: Date | string | null | undefined): string {
    if (!fecha) return '';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return isNaN(fechaObj.getTime()) ? '' : fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  verEvento(evento: Evento): void {
    localStorage.setItem('eventoSeleccionado', JSON.stringify(evento));
    this.router.navigate(['organizadores/organizador', this.idOrganizador, 'reporte', evento.id, 'resumen']);
  }

  aplicarFiltros(): void {
    this.cargarResumenOrganizador();
  }

  limpiarFiltros(): void {
    this.inicializarFechasPorDefecto();
    this.cargarResumenOrganizador();
  }
}