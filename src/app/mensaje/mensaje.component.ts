import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mensaje',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './mensaje.component.html',
  styleUrl: './mensaje.component.scss'
})
export class MensajeComponent implements OnInit {

  mensaje: string;
  mostrarBotones: boolean = false;
  mostrarInputNumero: boolean = false;
  numeroInput: number | null = null; 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MensajeComponent>
  ) { }

  ngOnInit(): void {
    this.mensaje = this.data.mensaje
    this.mostrarBotones = this.data.mostrarBotones || false;
    this.mostrarInputNumero = this.data.mostrarInputNumero || false;
  }

  confirmar() {
    if (this.mostrarInputNumero) {
      this.dialogRef.close({ confirmado: true, numero: this.numeroInput });
    } else {
      this.dialogRef.close(true);
    }
  }

  cancelar() {
    if (this.mostrarInputNumero) {
      this.dialogRef.close({ confirmado: false, numero: this.numeroInput });
    } else {
      this.dialogRef.close(false);
    }
  }

  cerrar() {
    this.dialogRef.close(); 
  }
}
