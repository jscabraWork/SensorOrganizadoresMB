// crear-recursos.component.ts
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Recurso } from '../../../../../models/pagina.model';
import { RecursosDataService } from '../../../../../service/data/recursos-data.service';
import { CommonAgregarComponent } from '../../../../../commons-components/common-agregar/common-agregar.component';

@Component({
  selector: 'app-crear-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-recursos.component.html',
  styleUrls: ['./crear-recursos.component.scss']
})
export class CrearRecursosComponent extends CommonAgregarComponent<Recurso, RecursosDataService> implements OnInit {
  @Input() paginaId: number | null = null;
  @Input() tipoRecurso: number = -1; // -1: ambos, 0: imágenes, 1: videos
  @Output() recursoCreado = new EventEmitter<Recurso>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Modo de creación
  modo: 'archivo' | 'url' = 'archivo';

  // Archivos
  archivos: File[] = [];
  subiendo = false;
  dragging = false;

  // Recurso para URL (heredamos 'e' de CommonAgregarComponent pero usamos este para claridad)
  nuevoRecurso: Recurso = new Recurso();

  constructor(
    protected override service: RecursosDataService,
    protected override router: Router,
    protected override dialog: MatDialog
  ) {
    super(service, router, dialog);
  }

  override ngOnInit(): void {
    // No llamamos super.ngOnInit() porque no queremos el comportamiento estándar
    this.configurarTipoRecurso();
  }

  private configurarTipoRecurso(): void {
    if (this.tipoRecurso !== -1) {
      this.nuevoRecurso.tipo = this.tipoRecurso;
    }
  }

  // Cambiar modo
  cambiarModo(modo: 'archivo' | 'url'): void {
    this.modo = modo;
    this.limpiar();
  }

  private limpiar(): void {
    this.archivos = [];
    this.nuevoRecurso = new Recurso();
    this.configurarTipoRecurso();
  }

  // === VALIDACIONES ===
  private validarUrlMultimedia(url: string): boolean {
    // YouTube URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/).+/;
    if (youtubeRegex.test(url)) return true;

    // Vimeo URLs
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
    if (vimeoRegex.test(url)) return true;

    // Extensiones de archivos multimedia
    const extensionesValidas = [
      // Imágenes
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
      // Videos
      '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'
    ];

    return extensionesValidas.some(ext => url.toLowerCase().includes(ext));
  }

  // === ARCHIVOS ===
  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) this.procesarArchivos(files);
  }

  seleccionarArchivos(): void {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const files = event.dataTransfer?.files;
    if (files) this.procesarArchivos(files);
  }

  private procesarArchivos(fileList: FileList): void {
    for (let i = 0; i < fileList.length; i++) {
      const archivo = fileList[i];

      // Validar tipo
      if (!this.esArchivoValido(archivo)) continue;

      // Validar tamaño (20MB)
      if (archivo.size > 20 * 1024 * 1024) {
        this.mensaje(`${archivo.name} excede el límite de 20MB`);
        continue;
      }

      this.archivos.push(archivo);
    }
  }

  private esArchivoValido(archivo: File): boolean {
    const esImagen = archivo.type.startsWith('image/');
    const esVideo = archivo.type.startsWith('video/');

    if (this.tipoRecurso === 0 && !esImagen) {
      this.mensaje('Solo se permiten imágenes');
      return false;
    }
    if (this.tipoRecurso === 1 && !esVideo) {
      this.mensaje('Solo se permiten videos');
      return false;
    }
    if (this.tipoRecurso === -1 && !esImagen && !esVideo) {
      this.mensaje('Solo se permiten imágenes y videos');
      return false;
    }
    return true;
  }

  eliminarArchivo(index: number): void {
    this.archivos.splice(index, 1);
  }

  subirArchivos(): void {
    if (!this.paginaId || this.archivos.length === 0) {
      this.mensaje('No hay archivos para subir o página no especificada');
      return;
    }

    this.subiendo = true;
    let completados = 0;

    this.archivos.forEach(archivo => {
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('paginaId', this.paginaId!.toString());
      formData.append('nombre', archivo.name);

      this.service.subir(formData).subscribe({
        next: (response: any) => {
          if (response?.recurso) {
            this.recursoCreado.emit(response.recurso);
          }
          this.finalizarSubida(++completados);
        },
        error: (error) => {
          this.mensaje(`Error al subir ${archivo.name}: ${error.message || 'Error desconocido'}`);
          this.finalizarSubida(++completados);
        }
      });
    });
  }

  private finalizarSubida(completados: number): void {
    if (completados === this.archivos.length) {
      this.subiendo = false;
      this.archivos = [];
      if (completados > 0) {
        this.mensaje('Archivos subidos correctamente');
      }
    }
  }

  // === URL ===
  crearPorUrl(): void {
    if (!this.paginaId) {
      this.mensaje('Página no especificada');
      return;
    }

    if (!this.nuevoRecurso.url || !this.nuevoRecurso.nombre) {
      this.mensaje('URL y nombre son obligatorios');
      return;
    }

    // Validar URL básica
    try {
      new URL(this.nuevoRecurso.url);
    } catch {
      this.mensaje('URL no válida');
      return;
    }

    // Validar que sea URL multimedia
    if (!this.validarUrlMultimedia(this.nuevoRecurso.url)) {
      this.mensaje('La URL debe ser de YouTube, Vimeo o contener una extensión de archivo multimedia válida (.jpg, .mp4, etc.)');
      return;
    }

    const recurso = { ...this.nuevoRecurso };
    recurso.pagina = { id: this.paginaId } as any;

    this.service.crearUrl(recurso, this.paginaId).subscribe({
      next: (response: any) => {
        if (response?.recurso) {
          this.recursoCreado.emit(response.recurso);
          this.limpiar();
          this.mensaje('Recurso creado correctamente');
        }
      },
      error: (error) => {
        this.mensaje(`Error al crear recurso: ${error.message || 'Error desconocido'}`);
      }
    });
  }

  // Override del método save para manejar ambos modos
  override save(): void {
    if (this.modo === 'archivo') {
      this.subirArchivos();
    } else {
      this.crearPorUrl();
    }
  }

  // === UTILIDADES ===
  formatearTamano(size: number): string {
    if (!size) return '';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}