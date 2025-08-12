import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Tarifa } from '../../models/tarifa.model';
import { API_URL_EVENTO, API_URL_PAGOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TarifaDataService extends CommonDataService<Tarifa> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/tarifas'
  protected baseEndpointPagos: string = API_URL_PAGOS + '/tarifas'

  constructor(protected override http: HttpClient) {
      super(http)
     }

  public listarPorEstado(localidadId: number, estado: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseEndpoint}/listar/estado?localidadId=${localidadId}&pEstado=${estado}`)
  }

  public listarPorEvento(eventoId: number): Observable<Tarifa[]> {
      return this.http.get<Tarifa[]>(`${this.baseEndpoint}/listar/${eventoId}`);
  }   

  public editarEstadoDeTarifa(tarifa: Tarifa): Observable<Tarifa> {
      return this.http.put<Tarifa>(
        `${this.baseEndpoint}/estado/${tarifa.id}?estado=${tarifa.estado}`,
        null
      )
     }

  public editarTarifa(tarifa: Tarifa): Observable<Tarifa> {
    return this.http.put<Tarifa>(`${this.baseEndpoint}/actualizar/${tarifa.id}`, tarifa)
  }
     
  public borrarTarifa(id: number): Observable<any> {
    return this.http.delete(`${this.baseEndpoint}/borrar/${id}`);
   }

   // URL PAGOS

  public tieneTicketsAsociados(id: number): Observable<boolean> {
  return this.http.get<boolean>(`${this.baseEndpointPagos}/${id}/tiene-tickets`);
  }

  public listarPorLocalidadId(id: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseEndpointPagos}/buscar/${id}`);
  }
}
