import { Dia } from './../../models/dia.model';
import { Injectable } from '@angular/core';
import { API_URL_PROMOTORES, API_URL_PUNTOS_FISICOS, API_URL_REPORTE } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteDataService {

  baseEndpoint: string = API_URL_REPORTE + '/organizadores';

  endpointEventos: string = API_URL_REPORTE + '/eventos';

  endpointPromotores: string = API_URL_PROMOTORES + '/reporte';

  endpointTaquilla: string = API_URL_PUNTOS_FISICOS + '/reporte';

  endpointAdmin: string = API_URL_REPORTE + '/admin';

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

  getReseumenGeneralOrganizador(
    numeroDocumento: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<any> {
    let params = '';
    const queryParams: string[] = [];

    if (fechaInicio) {
      queryParams.push(`fechaInicio=${encodeURIComponent(fechaInicio)}`);
    }
    if (fechaFin) {
      queryParams.push(`fechaFin=${encodeURIComponent(fechaFin)}`);
    }

    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }

    return this.http.get<any>(`${this.baseEndpoint}/resumen-organizador/${numeroDocumento}`);
  }

  //Obtiene el resumen completo del evento con gráficas
  getResumenEvento(eventoId: string, anio?: number, mes?: number): Observable<any> {
    let params = '';
    const queryParams: string[] = [];
    
    if (anio != -1) {
      queryParams.push(`anio=${anio}`);
    }

    if (mes != -1) {
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
    
    if (localidadId != -1) {
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
    if (tipo != 0) {
      queryParams.push(`tipo=${tipo}`);
    }

    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }

    return this.http.get<any>(`${this.baseEndpoint}/historial-transacciones/${eventoId}${params}`);
  }

  // Descarga archivo Excel del historial de transacciones por estado
  descargarExcelHistorialTransacciones(eventoId: number, status: number): Observable<Blob> {
    return this.http.get(`${this.baseEndpoint}/historial-excel/${eventoId}/excel?status=${status}`, {
      responseType: 'blob'
    });
  }

  // Obtiene las alcancias por evento y estado
  getAlcanciasByEventoAndEstado(eventoId: number, estado?: number): Observable<any> {
    let params = '';
    if (estado !== undefined && estado !== null) {
      params = `?estado=${estado}`;
    }
    return this.http.get<any>(`${this.baseEndpoint}/alcancias/${eventoId}${params}`);
  }

  // Obtiene las ventas de todos los promotores del evento
  getVentasPromotorByEventoId(eventoId: number): Observable<any> {
    return this.http.get<any>(`${this.endpointPromotores}/${eventoId}`);
  }

  // Obtiene las ventas por evento y promotor
  getVentasByEventoIdAndPromotor(eventoId: number, numeroDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.endpointPromotores}/${eventoId}/promotor/${numeroDocumento}`);
  }

  // Obtiene las ventas de todos los puntos físicos (taquilla) del evento
  getVentasTaquillaByEventoId(eventoId: number): Observable<any> {
    return this.http.get<any>(`${this.endpointTaquilla}/${eventoId}`);
  }

  // Obtiene las ventas por evento y punto físico (taquilla)
  getVentasByEventoIdAndTaquilla(eventoId: number, numeroDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.endpointTaquilla}/${eventoId}/taquilla/${numeroDocumento}`);
  }


  getResumenAdmin(eventoId?: number, anio?: number, mes?: number, dia?: number): Observable<any> {
  let params = '';
  const queryParams: string[] = [];
 
  if (eventoId != null && eventoId != -1) {
    queryParams.push(`pEventoId=${eventoId}`);
  }
 
  if (anio != null && anio != -1) { // ← Aquí estaba faltando la condición !== -1
    queryParams.push(`pAnio=${anio}`);
  }
 
  if (mes != null && mes != -1) {
    queryParams.push(`pMes=${mes}`);
  }
 
  if (dia != null && dia != -1) {
    queryParams.push(`pDia=${dia}`);
  }
 
  if (queryParams.length > 0) {
    params = '?' + queryParams.join('&');
  }
 
  return this.http.get<any>(`${this.endpointAdmin}/resumen${params}`);
}
}
