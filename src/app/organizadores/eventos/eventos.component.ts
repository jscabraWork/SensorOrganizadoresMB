import { ReporteDataService } from './../../service/data/reporte-data.service';
import { OrganizadorDataService } from './../../service/data/organizador-data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.scss'
})
export class EventosComponent implements OnInit, OnDestroy {
  eventos: Evento[] = [];
  loading: boolean = false;
  isHistorial: boolean = false;
  private readonly destroy$: Subject<void> = new Subject<void>();
  
  constructor(
    private readonly reporteDataService: ReporteDataService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkRoute();
    this.loadEventos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRoute(): void {
    const url: string = this.router.url;
    this.isHistorial = url.includes('/historial');
  }

  private loadEventos(): void {
    this.loading = true;
    const numeroDocumento: string | null = this.getNumeroDocumentoFromRoute();
    
    if (!numeroDocumento) {
      console.error('No se encontró el número de documento del promotor en la ruta');
      this.loading = false;
      return;
    }

    const eventosObservable = this.isHistorial 
      ? this.reporteDataService.getEventosHistorial(numeroDocumento)
      : this.reporteDataService.getEventosActivos(numeroDocumento);

    eventosObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response)
          this.eventos = response?.eventos || [];
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al cargar eventos:', error);
          this.eventos = [];
          this.loading = false;
        }
      });
  }

  private getNumeroDocumentoFromRoute(): string | null {
    return this.route.parent?.snapshot.paramMap.get('idOrganizador') || null;
  }

  getImagenPrincipal(evento: Evento): string | null {
    if (!evento.imagenes || evento.imagenes.length === 0) {
      return null;
    }

    const imagenPrincipal = evento.imagenes.find(imagen => imagen.tipo === 1);
    return imagenPrincipal?.url || null;
  }

  private parseDate(fecha: Date | string | null | undefined): Date | null {
    if (!fecha) return null;
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return isNaN(fechaObj.getTime()) ? null : fechaObj;
  }

  formatFecha(fecha: Date | string | null | undefined): string {
    const fechaObj = this.parseDate(fecha);
    return fechaObj ? fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) : 'Fecha no disponible';
  }

  formatHora(fecha: Date | string | null | undefined): string {
    const fechaObj = this.parseDate(fecha);
    return fechaObj ? fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) : '';
  }


  verEvento(evento: Evento): void {
    localStorage.setItem('eventoSeleccionado', JSON.stringify(evento));
    this.router.navigate(['../reporte', evento.id, 'resumen'], { relativeTo: this.route });
  }
}