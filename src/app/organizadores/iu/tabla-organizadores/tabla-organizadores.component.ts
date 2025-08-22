import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderPuntosComponent } from '../loader-puntos/loader-puntos.component';

export interface ColumnaTabla {
  key: string;
  label: string;
  tipo?: 'texto' | 'moneda' | 'fecha' | 'custom' | 'porcentaje';
  alineacion?: 'left' | 'center' | 'right';
  ancho?: string;
}

export interface AccionTabla {
  texto: string;
  icono?: string;
  clase?: string;
  mostrar?: (item: any) => boolean;
}

@Component({
  selector: 'app-tabla-organizadores',
  imports: [CommonModule, LoaderPuntosComponent],
  templateUrl: './tabla-organizadores.component.html',
  styleUrl: './tabla-organizadores.component.scss'
})
export class TablaOrganizadoresComponent {
  @Input() datos: any[] = [];
  @Input() columnas: ColumnaTabla[] = [];
  @Input() accion?: AccionTabla;
  @Input() expandible: boolean = false;
  @Input() plantillaExpandida?: TemplateRef<any>;
  @Input() cargando: boolean = false;
  @Input() sinDatosMensaje: string = 'No se encontraron registros';
  @Input() titulo?: string;
  @Input() subtitulo?: string;
  @Input() datosExpandidos?: (item: any) => any;
  @Input() plantillaSubtabla?: TemplateRef<any>;
  @Input() mostrarPieTabla: boolean = false;
  @Input() pieTabla?: { [key: string]: any };

  @Output() accionClick = new EventEmitter<any>();
  @Output() filaExpandida = new EventEmitter<{ item: any, index: number, expandido: boolean }>();

  filasExpandidas: Set<number> = new Set();

  toggleFilaExpandida(index: number, item: any): void {
    const estaExpandida = this.filasExpandidas.has(index);
    
    if (estaExpandida) {
      this.filasExpandidas.delete(index);
    } else {
      this.filasExpandidas.add(index);
    }
    
    this.filaExpandida.emit({
      item,
      index,
      expandido: !estaExpandida
    });
  }

  isFilaExpandida(index: number): boolean {
    return this.filasExpandidas.has(index);
  }

  onAccionClick(item: any): void {
    this.accionClick.emit(item);
  }

  deberiaMostrarAccion(item: any): boolean {
    return this.accion?.mostrar ? this.accion.mostrar(item) : true;
  }

  obtenerValorCelda(item: any, columna: ColumnaTabla): any {
    const keys = columna.key.split('.');
    let valor = item;
    
    for (const key of keys) {
      valor = valor?.[key];
    }
    
    return valor;
  }

  formatearValor(valor: any, tipo?: string): string {
    if (valor === null || valor === undefined || valor === '') return 'N/A';
    
    switch (tipo) {
      case 'moneda':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(valor);
      
      case 'fecha':
        try {
          return new Date(valor).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return valor?.toString() || 'N/A';
        }
      
      case 'porcentaje':
        const numero = parseFloat(valor);
        return isNaN(numero) ? 'N/A' : `${numero.toFixed(2)}%`;
      
      default:
        return valor?.toString() || 'N/A';
    }
  }

  obtenerClaseAlineacion(alineacion?: string): string {
    switch (alineacion) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return '';
    }
  }

  obtenerColspan(): number {
    let count = this.columnas.length;
    if (this.expandible) count += 1;
    if (this.accion) count += 1;
    return count;
  }
}