import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Ciudad } from '../../models/ciudad.model';
import { CiudadDataService } from '../../service/data/ciudad-data.service';
import { MensajeComponent } from '../../mensaje/mensaje.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-ciudades',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './ciudades.component.html',
  styleUrl: './ciudades.component.scss'
})
export class CiudadesComponent implements OnInit {

  selectedItem: number | null = null;
  cargando:boolean
  ciudades: Ciudad[] = []
  nombre: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ciudadesService: CiudadDataService,
    private dialog: MatDialog
  ){

  }

  ngOnInit(): void {

    this.route.parent?.paramMap.subscribe(params => {
      this.nombre = params.get('nombre');
      console.log(this.nombre)
    });

    this.cargarCiudades()

  }


  cargarCiudades(): void {
    this.cargando = true
    this.ciudadesService.listarCiudades().subscribe({
      next: (response) => {
        this.ciudades = response;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando ciudades', error);
        this.cargando = false
        this.ciudades = [];
      }
    })

  }

  toggleItem(index: number): void {
    this.selectedItem = this.selectedItem === index ? null : index;
  }

  editarCiudad(ciudad: Ciudad) {
    this.router.navigate(['/administradores/admin', this.nombre, 'ciudades', 'editar', ciudad.id]);
  }

  refrescar () {
    this.cargarCiudades()
  }

  eliminarCiudad(id: number): void {
    this.openMensaje("¿Desea borrar la ciudad?", true).subscribe(confirmado => {
      if (!confirmado) {
        this.openMensaje("No se realizó el borrado");
        return;
      }

      this.cargando = true;
      this.ciudadesService.getPorId(id).subscribe({
        next: (ciudad) => {
          if (ciudad.venues?.length > 0) {
            this.cargando = false;
            this.openMensaje("No se puede eliminar la ciudad porque tiene venues asociados");
            return;
          }
          this.ciudadesService.delete(id).subscribe({
            next: () => {
              this.cargando = false;
              this.openMensaje("Se borró exitosamente la ciudad");
              this.refrescar();
            },
            error: (error) => {
              this.cargando = false;
              const mensaje = error.error?.message || "Sucedió un error al eliminar";
              this.openMensaje(mensaje);
            }
          });
        },
        error: () => {
          this.cargando = false;
          this.openMensaje("No se pudo obtener la información de la ciudad");
        }
      });
    });
  }

  navigateToAgregarCiudad() {
    this.router.navigate(['../ciudades/agregar'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['/administradores/admin', this.nombre]);
  }
  
  irAVenues(idCiudad: number): void {
    this.router.navigate([
      '/administradores','admin',this.nombre,'ciudad',idCiudad,'venues'
    ]);

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


}
