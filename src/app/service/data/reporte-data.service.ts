import { Injectable } from '@angular/core';
import { API_URL_REPORTE } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteDataService {

  baseEndpoint: string = API_URL_REPORTE + '/organizadores';

  endpointEventos: string = API_URL_REPORTE + '/eventos';

  constructor(private http: HttpClient) { }

  getEventosActivos(numeroDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/eventos/${numeroDocumento}`);
  }

  //Obtiene la lista de eventos terminados del promotor
  //Ademas trae el objeto promotor
  getEventosHistorial(numeroDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/terminados/${numeroDocumento}`);
  }

  //Obtiene la lista de eventos terminados del promotor
  //Ademas trae el objeto promotor
  getEventoById(eventoId): Observable<Evento> {
    return this.http.get<Evento>(`${this.endpointEventos}/${eventoId}`);
  }

  //Obtiene el resumen completo del evento con gráficas
  getResumenEvento(eventoId: string, anio?: number, mes?: number): Observable<any> {
    let params = '';
    const queryParams: string[] = [];
    
    if (anio !== undefined) {
      queryParams.push(`anio=${anio}`);
    }
    
    if (mes !== undefined && mes !== -1) {
      queryParams.push(`mes=${mes}`);
    }
    
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
    return this.http.get<any>(`${this.baseEndpoint}/resumen/${eventoId}${params}`);
  }

  getDetalleEvento(eventoId: string, tarifaId?: number, localidadId?: number, diaId?: number): Observable<any> {
    let params = '';
    const queryParams: string[] = [];
    
    if (tarifaId !== undefined && tarifaId !== null) {
      queryParams.push(`tarifaId=${tarifaId}`);
    }
    
    if (localidadId !== undefined && localidadId !== null) {
      queryParams.push(`localidadId=${localidadId}`);
    }
    
    if (diaId !== undefined && diaId !== null) {
      queryParams.push(`diaId=${diaId}`);
    }
    
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
    
    return this.http.get<any>(`${this.baseEndpoint}/detalle-ventas/${eventoId}${params}`);
  }

  // Obtiene el historial de transacciones de un evento con filtros
  getHistorialTransaccionesEvento(
    eventoId: number,
    status: number,
    page: number,
    size: number,
    fechaInicio?: string,
    fechaFin?: string,
    tipo?: number
  ): Observable<any> {
    let params = '';
    const queryParams: string[] = [];

    queryParams.push(`status=${status}`);
    queryParams.push(`page=${page}`);
    queryParams.push(`size=${size}`);

    if (fechaInicio) {
      queryParams.push(`fechaInicio=${encodeURIComponent(fechaInicio)}`);
    }
    if (fechaFin) {
      queryParams.push(`fechaFin=${encodeURIComponent(fechaFin)}`);
    }
    if (tipo !== undefined && tipo !== null) {
      queryParams.push(`tipo=${tipo}`);
    }

    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }

    return this.http.get<any>(`${this.baseEndpoint}/historial-transacciones/${eventoId}${params}`);
  }

}
