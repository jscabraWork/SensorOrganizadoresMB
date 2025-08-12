import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Temporada } from '../../../models/temporada.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TemporadaDataService } from '../../../service/data/temporada-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { Observable } from 'rxjs';
import { HardcodedAutheticationService } from '../../../service/hardcoded-authetication.service';

@Component({
  selector: 'app-agregar-temporada',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-temporada.component.html',
  styleUrl: './agregar-temporada.component.scss'
})
export class AgregarTemporadaComponent {
  
  temporada: Temporada;
  formEnviado = false;
  fechaError = false;
  loading = false;
  nombre: string;
  modoEdicion = false;
  temporadaId: number | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private temporadaService: TemporadaDataService,
    private autenticado: HardcodedAutheticationService,
    private dialog: MatDialog,
  ) { 
    this.temporada = new Temporada()
  }

  ngOnInit(): void {
    this.nombre = this.autenticado.getAdmin()

    this.route.paramMap.subscribe(params => {
      const id = params.get('id')
      if(id) {
        this.temporadaId = +id;
        this.modoEdicion = true;
        this.cargarTemporada(this.temporadaId)

      }
    })
  }
  
  cargarTemporada(id: number) {
    this.loading = true;
    this.temporadaService.getPorId(id).subscribe({
      next: (data) => {
        this.temporada = data;
        this.loading = false;
      }, error: (error) => {
        console.error('Error al cargar la temporada:', error);
        this.loading = false;
        this.openMensaje('Error al cargar los datos de la temporada');
        this.router.navigate(['/administradores/admin', this.nombre, 'temporadas']);
      }
    });
  }

  crearTemporada() {
    this.formEnviado = true;
    this.fechaError = false; 
    this.loading = true; 

    if (this.temporada.fechaInicio && this.temporada.fechaFin) {
      const inicio = new Date(this.temporada.fechaInicio);
      const fin = new Date(this.temporada.fechaFin);
      
      if (inicio >= fin) {
        this.fechaError = true;
        this.loading = false; 
        this.openMensaje('La fecha inicio no puede ser mayor a la fecha fin');
        return; 
      }
    }

    // Formatear fechas para asegurar el tiempo correcto
    const fechaInicio = new Date(this.temporada.fechaInicio);
    const fechaFin = new Date(this.temporada.fechaFin);
    
    this.temporada.fechaInicio = fechaInicio.toISOString().split('T')[0] + 'T00:00:00';
    this.temporada.fechaFin = fechaFin.toISOString().split('T')[0] + 'T23:59:59';

    if (this.isFormValid()) {
      if(this.modoEdicion) {
        this.actualizarTemporada();
        } else {
        this.crearNuevaTemporada();
        } 
      } else {
        this.loading = false; 
      }
    }

  isFormValid(): boolean {
    return !!this.temporada.nombre && 
           !!this.temporada.fechaInicio && 
           !!this.temporada.fechaFin;
  }

  openMensaje(mensajeT:string, confirmacion: boolean = false): Observable<Boolean> {
          let screenWidth = screen.width;
          let anchoDialog:string = '500px';
          let anchomax:string = '80vw';
          let altoDialog:string = '250';
          if(screenWidth<=600){
            anchoDialog = '100%';
            anchomax = '100%';
            altoDialog = 'auto';
          }
          const dialogRef = this.dialog.open(MensajeComponent, {
            width: anchoDialog,
            maxWidth: anchomax,
            height: altoDialog,
            data:{
              mensaje:mensajeT,
              mostrarBotones: confirmacion
            }
          });
          return dialogRef.afterClosed();
        }

    crearNuevaTemporada() {
      this.temporadaService.crear(this.temporada).subscribe({
        next: (response) => {
          this.loading = false; 
          this.openMensaje('Temporada creada exitosamente');
          this.router.navigate(['/administradores/admin', this.nombre, 'temporadas']);
        },
        error: (err) => {
          this.loading = false; 
          console.error('Error:', err);
          alert('Error al crear la temporada'); 
        }
      });
    }

    actualizarTemporada() {
      this.temporadaService.editarTemporada(this.temporada).subscribe({
        next: (response) => {
          this.loading = false;
          this.openMensaje('Temporada actualizada exitosamente');
          this.router.navigate(['/administradores/admin', this.nombre, 'temporadas']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error:', err);
          this.openMensaje('Error al actualizar la temporada')
        }
      });
    }

    goBack() {
     this.router.navigate(['/administradores/admin', this.nombre, 'temporadas']);
    }
}
