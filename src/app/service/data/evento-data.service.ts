import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Evento } from '../../models/evento.model';
import { HttpClient } from '@angular/common/http';
import { API_URL_EVENTO } from '../../app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoDataService extends CommonDataService<Evento> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/eventos';

  constructor(protected override http: HttpClient) {
    super(http)
   }

   public listarPorEstado(temporadaId: number, estado: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseEndpoint}/listar/estado?temporadaId=${temporadaId}&pEstado=${estado}`);
   }

   public buscarEvento(eventoId: number): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/buscar/editar?eventoId=${eventoId}`);
   }

   public editarEstadoDeEvento(evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(
      `${this.baseEndpoint}/estado/${evento.id}?estado=${evento.estado}`,
      null
    )
   }

   public editarEvento(evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.baseEndpoint}/actualizar/${evento.id}`, evento);
   }

   public borrarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.baseEndpoint}/borrar/${id}`);
   }

}
