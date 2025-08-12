import { Component } from '@angular/core';
import { Venue } from '../../../models/venue.model';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueDataService } from '../../../service/data/venue-data.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeComponent } from '../../../mensaje/mensaje.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-venue',
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule
    ],
  templateUrl: './agregar-venue.component.html',
  styleUrl: './agregar-venue.component.scss'
})
export class AgregarVenueComponent {
  venue: Venue;
  formEnviado = false;
  fechaError = false;
  loading = false;
  nombre: string;
  modoEdicion = false;
  venueId: number | null = null
  ciudadId: number | null = null
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private venueService: VenueDataService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.venue = new Venue

    this.route.parent?.paramMap.subscribe(params => {
      this.nombre = params.get('nombre');
      console.log(this.nombre);
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id')
      this.ciudadId = +params.get('idCiudad')
      if(id) {
        this.venueId = +id;
        this.modoEdicion = true;
        this.cargarVenue(this.venueId)
      }
    })
  }

  validateGoogleMapsUrl(url: string): boolean {
    // Expresión regular para validar URLs de Google Maps estándar y maps.app.goo.gl
    const googleMapsRegex = /^(https?:\/\/)?(www\.)?(google\.[a-z]+\/maps\/.+|maps\.app\.goo\.gl\/.+)/i;
    return googleMapsRegex.test(url);
  }

  cargarVenue(id: number) {
    this.loading = true;
    this.venueService.getPorId(id).subscribe({
      next: (data) => {
        this.venue = data;
        this.loading = false;
      }, error: (error) => {
        console.error('Error al cargar el venue:', error);
        this.loading = false;
        this.openMensaje('Error al cargar los datos del venue');
        this.router.navigate(['/administradores/admin', this.nombre, 'ciudad', this.ciudadId, 'venues']);
      }
    });
  }


  crearVenue() {
      this.formEnviado = true;
      this.fechaError = false;
      this.loading = true;

      if (this.isFormValid()) {
        this.venueService.crearVenue(this.venue,this.ciudadId).subscribe({
          next: (response) => {
            this.loading = false;
            this.openMensaje('Venue creado exitosamente');
            this.router.navigate(['/administradores/admin', this.nombre,'ciudad',this.ciudadId,'venues']);
          },
          error: (err) => {
            this.loading = false;
            if (err.status === 400) {
                this.openMensaje('Ya existe un venue con ese nombre');
            } else {
                console.error('Error:', err);
                this.openMensaje('Ocurrió un error al crear el venue');
            }
          }
        });
      } else {
        this.loading = false;
      }
  }

    isFormValid(): boolean {
      return !!this.venue.nombre && !!this.venue.urlMapa && this.validateGoogleMapsUrl(this.venue.urlMapa);
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

      actualizarVenue(){
        this.venueService.editarVenue(this.venue,this.ciudadId).subscribe({
          next: (response) => {
            this.loading = false;
            this.openMensaje('Venue actualizada exitosamente');
            this.router.navigate(['/administradores/admin', this.nombre, 'ciudad',this.ciudadId,'venues']);
          },
          error: (err) => {
            this.loading = false;
            console.error('Error:', err);
            alert('Error al actualizar el venue');
          }
        });
      }

      goBack() {
        this.router.navigate(['/administradores/admin', this.nombre, 'ciudad', this.ciudadId, 'venues']);
      }
}
