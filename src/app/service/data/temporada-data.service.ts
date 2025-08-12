import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Temporada } from '../../models/temporada.model';
import { API_URL_EVENTO } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemporadaDataService extends CommonDataService<Temporada> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/temporadas';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  public listarPorEstado(estado: number): Observable<Temporada[]> {
    return this.http.get<Temporada[]>(`${this.baseEndpoint}/listar/estado?pEstado=${estado}`);
  }

  public editarTemporada(temporada: Temporada): Observable<Temporada> {
    return this.http.put<Temporada>(`${this.baseEndpoint}/actualizar/${temporada.id}`, temporada);
  }

  public editarEstadoDeTemporada(temporada: Temporada): Observable<Temporada> {
    return this.http.put<Temporada>(
      `${this.baseEndpoint}/estado/${temporada.id}?estado=${temporada.estado}`,
      null
    );
  }

  public borrarTemporada(id: number): Observable<any> {
    return this.http.delete(`${this.baseEndpoint}/borrar/${id}`);
  }
  
  public override delete(id: number): Observable<any> {
    return this.borrarTemporada(id);
  }

}
