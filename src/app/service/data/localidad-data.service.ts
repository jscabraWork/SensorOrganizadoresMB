import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Localidad } from '../../models/localidad.model';
import { API_URL_EVENTO, API_URL_PAGOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dia } from '../../models/dia.model';

@Injectable({
  providedIn: 'root'
})
export class LocalidadDataService extends CommonDataService<Localidad> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/localidades'
  protected baseEndpointPagos: string = API_URL_PAGOS + '/localidades'

  constructor(protected override http: HttpClient) {
    super(http)
   }

   public crearLocalidad(localidad: Localidad, forzarCreacion: boolean = false): Observable<Localidad> {
    const diasIds = localidad.dias?.map(dia => dia.id) || [];
    const params = `forzarCreacion=${forzarCreacion}${diasIds.length ? `&diasIds=${diasIds.join(',')}` : ''}`;
    return this.http.post<Localidad>(`${this.baseEndpoint}/crear?${params}`, localidad);
  }
  
   public listarPorDia(diaId: number): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.baseEndpoint}/dia/${diaId}`);
   }

   public listarPorEventoId(eventoId: number): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.baseEndpoint}/evento/${eventoId}`)
   }


   public editarLocalidad(localidad: Localidad, forzarActualizacion: boolean = false): Observable<Localidad> {
    const diasIds = localidad.dias?.map(dia => dia.id) || [];
    const params = `forzarActualizacion=${forzarActualizacion}${diasIds.length ? `&diasIds=${diasIds.join(',')}` : ''}`;
    return this.http.put<Localidad>(`${this.baseEndpoint}/actualizar/${localidad.id}?${params}`, localidad);
   }


   public borrarLocalidad(id: number): Observable<any> {
    return this.http.delete(`${this.baseEndpoint}/borrar/${id}`);
   }

   public getByIdEdicion(localidadId: number): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/editar/${localidadId}`);
   }

   public  getPorIdPagos(id: any): Observable<any> {
     return this.http.get(`${this.baseEndpointPagos}/${id}`,{headers:this.headers});
  }

}
