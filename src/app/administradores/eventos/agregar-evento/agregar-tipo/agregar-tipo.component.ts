import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tipo } from '../../../../models/tipo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoDataService } from '../../../../service/data/tipo-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-tipo',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-tipo.component.html',
  styleUrl: './agregar-tipo.component.scss'
})
export class AgregarTipoComponent {

  tipo: Tipo;
  formEnviado = false
  loading = false
  nombre: string
  tipoId: number | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tipoService: TipoDataService,
    private dialog: MatDialog,
    private location: Location,
    private autenticado: HardcodedAutheticationService,

  ) { }

  ngOnInit(): void {
    this.tipo = new Tipo
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
    return !!this.tipo.nombre
  }

  crearNuevoTipo() {
    this.tipoService.crear(this.tipo).subscribe({
      next: (response) => {
        this.loading = false
        this.openMensaje("Tipo creado exitosamente");
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
