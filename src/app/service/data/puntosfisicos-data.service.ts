import { Injectable } from '@angular/core';
import { PuntoFisico } from '../../models/puntofisico.model';
import { API_URL_PUNTOS_FISICOS } from '../../app.constants';
import { CommonDataService } from '../commons/common-data.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PuntosFisicosDataService extends CommonDataService<PuntoFisico>{

  protected override baseEndpoint = API_URL_PUNTOS_FISICOS + "/puntosfisicos";

  endpointEventos = API_URL_PUNTOS_FISICOS + "/eventos";
  
  protected override atributoListado= 'evento';

  getPuntoFisicoByNumeroDocumento(numeroDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/puntofisico/${numeroDocumento}`);
  }

  getEventosByNoEstado(estado: number): Observable<any> {
    return this.http.get<any>(`${this.endpointEventos}/listar-no-estado/${estado}`);
  }

  asignarEventos(numeroDocumento: string, eventosId: number[]): Observable<any> {
    return this.http.patch<any>(`${this.baseEndpoint}/asignar-eventos/${numeroDocumento}`, eventosId);
  }

  filtrarPuntosFisicos(nombre?: string, numeroDocumento?: string, correo?: string): Observable<any> {
    let params = new HttpParams();
    
    if (nombre && nombre.trim()) {
      params = params.set('nombre', nombre.trim());
    }
    if (numeroDocumento && numeroDocumento.trim()) {
      params = params.set('numeroDocumento', numeroDocumento.trim());
    }
    if (correo && correo.trim()) {
      params = params.set('correo', correo.trim());
    }
    
    return this.http.get<any>(`${this.baseEndpoint}/filtrar`, { params });
  }
}
