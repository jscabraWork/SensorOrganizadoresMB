import { Directive, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MensajeComponent } from '../mensaje/mensaje.component';

@Directive()
export abstract class BaseComponent implements OnInit {
  
  cargando: boolean = false;
  error: string | null = null;
  pathVariable: string | null = null;
  
  protected pathVariableName: string = '';

  constructor(
    protected dialog: MatDialog,
    protected route?: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route && this.pathVariableName) {
      this.obtenerPathVariable();
    }
    this.cargarDatos();
  }

  private obtenerPathVariable(): void {
    // Buscar en la ruta actual primero
    this.route?.params.subscribe(params => {
      if (params[this.pathVariableName]) {
        this.pathVariable = params[this.pathVariableName];
        this.onPathVariableChanged(this.pathVariable);
        return;
      }
    });

    // Si no se encuentra, buscar en la ruta padre
    this.route?.parent?.params.subscribe(params => {
      if (params[this.pathVariableName]) {
        this.pathVariable = params[this.pathVariableName];
        this.onPathVariableChanged(this.pathVariable);
        return;
      }
    });

    // Si no se encuentra, buscar en la ruta abuelo
    this.route?.parent?.parent?.params.subscribe(params => {
      if (params[this.pathVariableName]) {
        this.pathVariable = params[this.pathVariableName];
        this.onPathVariableChanged(this.pathVariable);
      }
    });
  }

  protected onPathVariableChanged(value: string | null): void {
    // Override en componentes hijos si necesitan reaccionar al cambio
  }

  protected cargarDatos(): void {
    // Override en componentes hijos para implementar la carga de datos específica
  }

  mostrarMensaje(mensajeTexto: string, confirmacion: boolean = false): Observable<boolean> {
    const dialogRef = this.dialog.open(MensajeComponent, {
      width: '500px',
      maxWidth: '80vw',
      data: {
        mensaje: mensajeTexto,
        mostrarBotones: confirmacion
      }
    });
    return dialogRef.afterClosed();
  }

  mostrarError(mensaje: string) {
    this.error = mensaje;
    this.mostrarMensaje(mensaje);
  }

  limpiarError() {
    this.error = null;
  }

  iniciarCarga() {
    this.cargando = true;
    this.limpiarError();
  }

  finalizarCarga() {
    this.cargando = false;
  }

  manejarError(error: any, mensajePersonalizado?: string) {
    this.finalizarCarga();
    const mensaje = mensajePersonalizado || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    this.mostrarError(mensaje);
    console.error('Error:', error);
  }

  confirmar(mensaje: string): Observable<boolean> {
    return this.mostrarMensaje(mensaje, true);
  }
}