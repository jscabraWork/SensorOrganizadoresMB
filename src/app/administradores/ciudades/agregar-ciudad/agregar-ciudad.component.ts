import { Component } from '@angular/core';
import { Ciudad } from '../../../models/ciudad.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CiudadDataService } from '../../../service/data/ciudad-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-ciudad',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './agregar-ciudad.component.html',
  styleUrl: './agregar-ciudad.component.scss'
})
export class AgregarCiudadComponent {

  ciudad: Ciudad;
  formEnviado = false;
  fechaError = false;
  loading = false;
  nombre: string;
  modoEdicion = false;
  ciudadId: number | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ciudadService: CiudadDataService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.ciudad = new Ciudad

    this.route.parent?.paramMap.subscribe(params => {
      this.nombre = params.get('nombre');
      console.log(this.nombre);
    });

    this.route.paramMap.subscribe(params => {
      const idCiudad = params.get('id')
      console.log(params)
      if(idCiudad) {
        this.ciudadId = +idCiudad;
        this.modoEdicion = true;
        this.cargarCiudad(this.ciudadId)

      }
    })
  }

  cargarCiudad(id: number) {
    this.loading = true;
    this.ciudadService.getPorId(this.ciudadId).subscribe({
      next: (data) => {
        this.ciudad = data;
        this.loading = false;
      }, error: (error) => {
        console.error('Error al cargar la ciudad:', error);
        this.loading = false;
        this.openMensaje('Error al cargar los datos de la ciudad');
        this.router.navigate(['/administradores/admin', this.nombre, 'ciudades']);
      }
    });
  }


  crearCiudad() {
    this.formEnviado = true;
    this.loading = true;


    if (this.isFormValid()) {
      if(this.modoEdicion) {
        this.actualizarCiudad();
        } else {
        this.crearNuevaCiudad();
        }
      } else {
        this.loading = false;
      }
  }

    isFormValid(): boolean {
      return !!this.ciudad.nombre
    }

    crearNuevaCiudad(){
      this.ciudadService.crearCiudad(this.ciudad).subscribe({
        next: (response) => {
          this.loading = false;
          this.openMensaje('Ciudad creada exitosamente');
          this.router.navigate(['/administradores/admin', this.nombre, 'ciudades']);
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 400) {
              this.openMensaje('Ya existe una ciudad con ese nombre');
          } else {
              console.error('Error:', err);
              this.openMensaje('Ocurrió un error al crear la ciudad');
          }
        }
      });
    }

    openMensaje(mensajeT:string,openD?:string):void{
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
            mensaje:mensajeT
          }
        });
      }

      actualizarCiudad(){
        this.ciudadService.editarCiudad(this.ciudad).subscribe({
          next: (response) => {
            this.loading = false;
            this.openMensaje('Ciudad actualizada exitosamente');
            this.router.navigate(['/administradores/admin', this.nombre, 'ciudades']);
          },
          error: (err) => {
            this.loading = false;
            console.error('Error:', err);
            alert('Error al actualizar la ciudad');
          }
        });
      }

      goBack() {
        this.router.navigate(['/administradores/admin',this.nombre,'ciudades']);
      }
}
