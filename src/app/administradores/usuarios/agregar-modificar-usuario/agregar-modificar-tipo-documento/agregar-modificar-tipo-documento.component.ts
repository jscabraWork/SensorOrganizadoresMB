import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TipoDocumento } from '../../../../models/tipo-documento.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoDocumentoDataService } from '../../../../service/data/tipo-documento-data.service';
import { MatDialog } from '@angular/material/dialog';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';

@Component({
  selector: 'app-agregar-modificar-tipo-documento',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-modificar-tipo-documento.component.html',
  styleUrl: './agregar-modificar-tipo-documento.component.scss'
})
export class AgregarModificarTipoDocumentoComponent {

  tipoDocumento: TipoDocumento
  formEnviado = false
  loading = false
  nombre: string
  tipoDocumentoId: number | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tipoDocumentoService: TipoDocumentoDataService,
    private dialog: MatDialog,
    private location: Location,
    private autenticado: HardcodedAutheticationService
  ) { }

  ngOnInit(): void {
    this.tipoDocumento = new TipoDocumento
    this.nombre = this.autenticado.getAdmin();
  }

  crearTipo() {
    this.formEnviado = true;
    this.loading = true

    if (this.isFormValid()) {
      this.crearNuevoTipo()
    } else {
      this.loading = false;
    }
  }

  isFormValid(): boolean {
    return !!this.tipoDocumento.nombre
  }

  crearNuevoTipo() {
    this.tipoDocumentoService.crear(this.tipoDocumento).subscribe({
      next: (response) => {
        this.loading = false
        this.openMensaje("Tipo de Documento creado exitosamente");
        this.goBack()
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al crear el tipo', error)
        this.openMensaje('Ocurrió un error al crear el tipo')
      }
    })
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
          mensaje: mensajeT
        }
      });
    }

    goBack() {
    this.location.back()
  }
}
