import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';


import { MisTicketsComponent } from './mis-tickets/mis-tickets.component';
import { MisAlcanciasComponent } from './mis-alcancias/mis-alcancias.component';
import { Cliente } from '../../../../models/cliente.model';
import { HardcodedAutheticationService } from '../../../../service/hardcoded-authetication.service';
import { MensajeComponent } from '../../../../mensaje/mensaje.component';
import { UsuarioDataService } from '../../../../service/data/usuario-data.service';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatIconModule,
    MisTicketsComponent,
    MisAlcanciasComponent
  ]
})
export class UsuarioPerfilComponent implements OnInit {
  cargando: boolean = false;
  user: string = '';
  usuario: Cliente = new Cliente();
  tickets: boolean = false;
  datos: boolean = true;
  alcancias: boolean = false;
  respuesta: any;
  pagar: boolean = false;
  url: string = '';

  constructor(
    private autenticador: HardcodedAutheticationService,
    private dataServicio: UsuarioDataService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.pagar = false;
    this.usuario = new Cliente();
    this.cargando = true;

    // Obtener el parámetro 'usuario' de la ruta
    this.route.paramMap.subscribe(params => {
      this.user = params.get('usuario');
      
      if (this.user) {
        this.dataServicio.buscarPorCorreo(this.user).subscribe({
          next: response => {
            this.usuario = response;
            this.cargando = false;
          },
          error: error => {
            this.cargando = false;
            this.openMensaje('Sucedió un error, vuelva a cargar');
          }
        });
      } else {
        this.cargando = false;
        this.openMensaje('No se encontró el parámetro de usuario');
      }
    });
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
        mensaje: mensajeT,
      },
    });
  }



  // Tab navigation methods
  showDatos(): void {
    this.datos = true;
    this.tickets = false;
    this.alcancias = false;
  }

  showTickets(): void {
    this.datos = false;
    this.tickets = true;
    this.alcancias = false;
  }

  showAlcancias(): void {
    this.datos = false;
    this.tickets = false;
    this.alcancias = true;
  }

  goBack(): void {
    this.location.back();
  }
}