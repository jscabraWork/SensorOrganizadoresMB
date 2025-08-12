// recursos.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrearRecursosComponent } from './crear-recursos/crear-recursos.component';
import { Recurso } from '../../../../models/pagina.model';
import { RecursosDataService } from '../../../../service/data/recursos-data.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonListarComponent } from '../../../../commons-components/common-listar/common-listar.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearRecursosComponent],
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.scss']
})
export class RecursosComponent extends CommonListarComponent<Recurso, RecursosDataService> implements OnInit {

  @Input() paginaId: number | null = null;
  @Input() tiposPermitidos: number[] = [];
  @Output() recursoSeleccionado = new EventEmitter<Recurso>();

  mostrarFormularioCreacion = false;

  constructor(
    protected override service: RecursosDataService,
    protected override dialog: MatDialog,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    super(service, dialog);
  }

  override ngOnInit(): void {
    this.obtenerPaginaId();
    super.ngOnInit(); // Llama al ngOnInit del CommonListarComponent
  }

  private obtenerPaginaId(): void {
    if (this.paginaId != null) {
      this.id = this.paginaId;
    } else {
      this.route.parent?.paramMap.subscribe(params => {
        const id = params.get('paginaId');
        if (id !== null) {
          this.id = +id;
        }
      });
    }
  }

  // Override del método manejar para aplicar filtros específicos
  override manejar(response: any): void {
    if (response?.lista) {
      this.filtrarRecursosPorTipo(response.lista);
    } else {
      this.lista = [];
    }
    console.log(response);
    console.log(this.lista);
  }

  private filtrarRecursosPorTipo(recursos: Recurso[]): void {
    this.lista = this.tiposPermitidos.length > 0 
      ? recursos.filter(recurso => this.tiposPermitidos.includes(recurso.tipo))
      : recursos;
  }

  seleccionarRecurso(recurso: Recurso): void {
    this.recursoSeleccionado.emit(recurso);
  }

  toggleFormularioCreacion(): void {
    this.mostrarFormularioCreacion = !this.mostrarFormularioCreacion;
  }

  onRecursoCreado(recurso: Recurso): void {
    if (!this.tiposPermitidos.length || this.tiposPermitidos.includes(recurso.tipo)) {
      this.lista = this.lista ? [recurso, ...this.lista] : [recurso];
    }
    this.mostrarFormularioCreacion = false;
  }

  formatearTamano(tamano: number): string {
    if (!tamano) return '';
    if (tamano < 1024) return tamano + ' B';
    if (tamano < 1024 * 1024) return (tamano / 1024).toFixed(1) + ' KB';
    return (tamano / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getSafeUrl(url: string) {
    const embedUrl = this.getEmbedUrl(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getEmbedUrl(url: string): string {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractYouTubeId(url);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  }

  private extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  esVideoDirecto(url: string): boolean {
    const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return extensionesVideo.some(ext => url.toLowerCase().includes(ext));
  }

  deleteById(recurso: Recurso, event: Event): void {
    event.stopPropagation();
    if (confirm(`¿Estás seguro de eliminar "${recurso.nombre}"?`)) {
      this.delete(recurso.id); // Usa el método delete del CommonListarComponent
    }
  }
}