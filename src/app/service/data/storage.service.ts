import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly EVENTO_KEY = 'evento_form_data';
  private readonly USUARIO_KEY = 'usuario_form_data';

  guardarDatosEvento(data: any): void {
    try {
      const dataString = JSON.stringify(data);
      sessionStorage.setItem(this.EVENTO_KEY, dataString);
    } catch (error) {
      console.error('Error al guardar datos en sessionStorage:', error);
    }
  }

  obtenerDatosEvento(): any {
    try {
      const data = sessionStorage.getItem(this.EVENTO_KEY);

      
      if (!data || data === 'null' || data === 'undefined') {
        return null;
      }
      
      // Verificar si los datos son una cadena JSON válida
      if (typeof data === 'string' && data.startsWith('{') && data.endsWith('}')) {
        return JSON.parse(data);
      } else {
        console.warn('Los datos en sessionStorage no son JSON válido:', data);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos de sessionStorage:', error);
      // Limpiar datos corruptos
      this.limpiarDatosEvento();
      return null;
    }
  }

  limpiarDatosEvento(): void {
    try {
      sessionStorage.removeItem(this.EVENTO_KEY);
    } catch (error) {
      console.error('Error al limpiar datos de sessionStorage:', error);
    }
  }

  guardarDatosUsuario(data: any): void {
    try {
      const dataString = JSON.stringify(data);
      sessionStorage.setItem(this.USUARIO_KEY, dataString);
    } catch (error) {
      console.error('Error al guardar datos de usuario en sessionStorage:', error);
    }
  }

  obtenerDatosUsuario(): any {
    try {
      const data = sessionStorage.getItem(this.USUARIO_KEY);
      if (!data || data === 'null' || data === 'undefined') {
        return null;
      }
      if (typeof data === 'string' && data.startsWith('{') && data.endsWith('}')) {
        return JSON.parse(data);
      } else {
        console.warn('Los datos de usuario en sessionStorage no son JSON válido:', data);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario de sessionStorage:', error);
      this.limpiarDatosUsuario();
      return null;
    }
  }

  limpiarDatosUsuario(): void {
    try {
      sessionStorage.removeItem(this.USUARIO_KEY);
    } catch (error) {
      console.error('Error al limpiar datos de usuario en sessionStorage:', error);
    }
  }
  
}