import { Component, OnInit } from '@angular/core';
import { Venue } from '../../models/venue.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajeComponent } from '../../mensaje/mensaje.component';
import { VenueDataService } from '../../service/data/venue-data.service';
import { CiudadDataService } from '../../service/data/ciudad-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-venues',
  imports: [
      CommonModule,
      RouterModule,
      FormsModule
    ],
  templateUrl: './venues.component.html',
  styleUrl: './venues.component.scss'
})
export class VenuesComponent implements OnInit  {

  selectedItem: number | null = null;
  cargando:boolean
  venues: Venue[] = []
  nombre: string;
  ciudadId: number;
  ciudadNombre: string
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private venuesService: VenueDataService,
    private ciudadService: CiudadDataService,
    private location: Location
  ){}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.nombre = params.get('nombre');
      console.log(this.nombre)
    });

    this.route.paramMap.subscribe(params => {
      this.ciudadId = +params.get('idCiudad')
    });

    this.cargarVenues()
    this.getCiudadPorId()
  }

  goback(){
    this.location.back()
  }


  getCiudadPorId() {
    this.ciudadService.getPorId(this.ciudadId).subscribe({
      next: (response) => {
        this.ciudadNombre = response.nombre;
      },
      error: (error) => {
        this.ciudadNombre = undefined;
        console.error('Error cargando ciudad', error);
      }
    });
  }

   cargarVenues(): void {
      this.cargando = true
      this.venuesService.listarVenuesByCiudadId(this.ciudadId).subscribe({
        next: (response) => {
          this.venues = response;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando venues', error);
          this.cargando = false
          this.venues = [];
        }
      })

    }

    toggleItem(index: number): void {
      this.selectedItem = this.selectedItem === index ? null : index;
    }

    editarVenue(venue: Venue) {
      this.router.navigate(['/administradores/admin', this.nombre,'ciudad',this.ciudadId,'venues', 'editar', venue.id]);
    }

    refrescar () {
      this.cargarVenues()
    }

    eliminarVenue(id: number): void {
      if (this.openMensaje("¿Desea borrar el venue?",true)) {
        this.cargando = true
        this.venuesService.getPorId(id).subscribe({
          next: (venue) => {
            this.cargando = false
            if (venue.eventos && venue.eventos.length > 0) {
              this.openMensaje("No se puede eliminar el venue porque tiene eventos asociados.");
            } else {
              this.venuesService.delete(id).subscribe({
                next: (response) => {
                  if (!response) {
                    this.cargando = false
                    this.openMensaje("Se borró exitosamente el venue")
                    this.refrescar();
                  } else {
                    alert(response.mensaje);
                  }
                },
                error: (error) => {
                  this.openMensaje("Sucedió un error, por favor vuelva a intentar.");
                }
              });
            }
          },
          error: (err) => {
            this.openMensaje("No se pudo obtener la información del venue.");
          }
        });
      } else {
        this.openMensaje("No se realizó el borrado");
      }
    }

    navigateToAgregarVenue() {
      this.router.navigate(['../venues/agregar'], { relativeTo: this.route });
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

      goBack() {
        this.router.navigate(['/administradores/admin',this.nombre,'ciudades']);
      }
}
