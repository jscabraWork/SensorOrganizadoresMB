import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonDataService } from '../commons/common-data.service';
import { Mapa } from '../../models/mapas/mapa.model';
import { Evento } from '../../models/evento.model';
import { Localidad } from '../../models/localidad.model';
import { Ticket } from '../../models/ticket.model';
import { API_URL_HTML, API_URL_MAPAS } from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class MapasDataService extends CommonDataService<Mapa>{

  protected override baseEndpoint = API_URL_MAPAS + "/mapas";

  protected override atributoListado= 'estado';

  /**
   * Obtiene los tickets asociados a una localidad específica
   * @param localidadId ID de la localidad
   * @returns Observable con la lista de tickets
   */
  getTicketsByLocalidad(localidadId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseEndpoint}/tickets/localidad/${localidadId}`);
  }

  /**
   * Obtiene las localidades asociadas a un evento específico
   * @param eventoId ID del evento
   * @returns Observable con la lista de localidades
   */
  getLocalidadesByEvento(eventoId: number): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.baseEndpoint}/localidades/evento/${eventoId}`);
  }
  /**
   * Obtiene los eventos que NO tienen el estado especificado
   * Por defecto excluye eventos con estado 3 (terminados/finalizados)
   * @param estado Estado a excluir (por defecto 3)
   * @returns Observable con la lista de eventos no terminados
   */
  getEventosNoTerminados(estado: number = 3): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseEndpoint}/eventos/estado-not/${estado}`);
  }

  /**
   * Obtiene todos los eventos excepto los que tienen el estado especificado
   * @param estado Estado a excluir
   * @returns Observable con la lista de eventos
   */
  getEventosByEstadoNot(estado: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseEndpoint}/eventos/estado-not/${estado}`);
  }
}
