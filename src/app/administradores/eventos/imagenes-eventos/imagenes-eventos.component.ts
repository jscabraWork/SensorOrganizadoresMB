import { Component, OnInit, OnDestroy, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonListarComponent } from '../../../commons-components/common-listar/common-listar.component';
import { ImagenesDataService } from '../../../service/data/imagenes-data.service';
import { Imagen } from '../../../models/imagen.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Evento } from '../../../models/evento.model';

@Component({
  selector: 'app-imagenes-eventos',
  templateUrl: './imagenes-eventos.component.html',
  styleUrl: './imagenes-eventos.component.scss',
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ImagenesEventosComponent extends CommonListarComponent<Imagen, ImagenesDataService> implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  evento: Evento;
  selectedFiles: File[] = [];
  imageTypes: { [key: number]: string } = {
    1: 'Principal',
    2: 'Banner',
    3: 'QR',
    4: 'Publicidad',
    5: 'Mapa'
  };
  selectedTypes: number[] = [];
  dragActive = false;

  constructor(
    protected override service: ImagenesDataService,
    protected override dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(service, dialog);
    this.evento = data?.evento;
    this.id = this.evento?.id;
    if (this.evento?.imagenes) {
      this.lista = this.evento.imagenes;
    }
  }

  override ngOnInit(): void {
    this.refrescar();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  agregarImagenes(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files || []);
    this.handleFiles(files);
  }

  private handleFiles(files): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      this.mensaje('Solo se permiten archivos de imagen');
    }
    
    // Validar tamaño de archivos (3MB máximo)
    const maxSize = 3 * 1024 * 1024; // 3MB en bytes
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      this.mensaje(`Algunos archivos superan el límite de 3MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    this.selectedFiles = [...this.selectedFiles, ...imageFiles];
    
    // Inicializar tipos por defecto
    imageFiles.forEach(() => {
      this.selectedTypes.push(1); // Tipo por defecto: Principal
    });
  }

  removeFile(index: number): void {
    // Clean up object URL to prevent memory leaks
    const file = this.selectedFiles[index];
    if (file) {
      URL.revokeObjectURL(this.getFilePreviewUrl(file));
    }
    
    this.selectedFiles.splice(index, 1);
    this.selectedTypes.splice(index, 1);
  }

  async subirImagenes(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.mensaje('Selecciona al menos una imagen');
      return;
    }

    this.cargando = true;
    
    try {
      await this.crearImagenesEvento(this.selectedFiles, this.evento.id, this.selectedTypes).toPromise();
      this.mensaje('Imágenes subidas correctamente');
      this.clearSelectedFiles();
      this.refrescar();
    } catch (error) {
      this.mensaje('Error al subir las imágenes');
    } finally {
      this.cargando = false;
    }
  }

  crearImagenesEvento(files: File[], pIdEvento: number, tipos: number[]) {
    return this.service.crearImagenesEvento(files, pIdEvento, tipos);
  }

  editarTipoImagen(imagen: Imagen): void {
    this.cargando = true;
    this.service.editarImagen(imagen, imagen.id).subscribe({
      next: () => {
        this.mensaje('Tipo de imagen actualizado');
        this.refrescar();
      },
      error: () => {
        this.cargando = false;
        this.mensaje('Error al actualizar el tipo de imagen');
      }
    });
  }

  eliminarImagen(imagen: Imagen): void {
    this.delete(imagen.id);
  }

  getFileSize(file: File): string {
    const sizeInMB = file.size / (1024 * 1024);
    return sizeInMB > 1 ? `${sizeInMB.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
  }

  getFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  clearSelectedFiles(): void {
    // Clean up object URLs to prevent memory leaks
    this.selectedFiles.forEach(file => {
      URL.revokeObjectURL(this.getFilePreviewUrl(file));
    });
    
    this.selectedFiles = [];
    this.selectedTypes = [];
  }

  ngOnDestroy(): void {
    this.clearSelectedFiles();
  }
}