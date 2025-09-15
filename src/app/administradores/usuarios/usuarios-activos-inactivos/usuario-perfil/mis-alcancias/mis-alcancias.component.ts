import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MisAlcanciasDto } from '../../../../../models/misalcancias.model';
import { Cliente } from '../../../../../models/cliente.model';
import { AlcanciasDataService } from '../../../../../service/data/alcancias-data.service';
import { MensajeComponent } from '../../../../../mensaje/mensaje.component';

@Component({
  selector: 'app-mis-alcancias',
  standalone: true,
  templateUrl: './mis-alcancias.component.html',
  styleUrls: ['./mis-alcancias.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule
  ]
})
export class MisAlcanciasComponent implements OnInit {
  cargando: boolean = false;
  misAlcancias: MisAlcanciasDto[] = [];
  valorTotal: number[] = [];
  description: string[] = [];
  pagar: boolean = false;
  codigoOrden: string = '';
  
  @Input()
  cliente: Cliente = new Cliente();

  constructor(
    private alcanciasService: AlcanciasDataService, 
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pagar = false;
    this.valorTotal = [];
    this.misAlcancias = [];
    this.description = [];
    this.cargando = true;
    
    this.alcanciasService.getAlcanciasByCliente(this.cliente.numeroDocumento).subscribe({
      next: (misAlcancias: MisAlcanciasDto[]) => {
        this.cargando = false;
        this.misAlcancias = misAlcancias || [];
        if (this.misAlcancias.length > 0) {
          this.inicializarValores();
        }
      },
      error: error => {
        this.cargando = false;
        this.openMensaje('Ocurrió un error al cargar las alcancías');
      }
    });
  }z

  inicializarValores(): void {
    for (let i = 0; i < this.misAlcancias.length; i++) {
      let valorFaltante = this.misAlcancias[i].alcancia.precioTotal - this.misAlcancias[i].alcancia.precioParcialPagado;
      this.valorTotal.push(valorFaltante);
      this.description.push('Aporte a alcancia para el evento ' + this.misAlcancias[i].eventoNombre);
    }
  }

  getValorFaltante(misAlcancia: MisAlcanciasDto): number {
    return misAlcancia.alcancia.precioTotal  - misAlcancia.alcancia.precioParcialPagado;
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
}