import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { API_URL_EVENTO } from '../../app.constants';
import { Dia } from '../../models/dia.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiaDataService extends CommonDataService<Dia> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/dias';
  
  constructor(protected override http: HttpClient) {
    super(http)
   }

   public listarPorEstado(eventoId: number, estado: number): Observable<Dia[]> {
    return this.http.get<Dia[]>(`${this.baseEndpoint}/listar/estado?eventoId=${eventoId}&pEstado=${estado}`);
   }

   public listarPorEvento(eventoId: number): Observable<Dia[]> {
    return this.http.get<Dia[]>(`${this.baseEndpoint}/listar/${eventoId}`);
   }


   public editarEstadoDeDia(dia: Dia): Observable<Dia> {
    return this.http.put<Dia>(
      `${this.baseEndpoint}/estado/${dia.id}?estado=${dia.estado}`,
      null
    )
   }

   public editarDia(dia: Dia): Observable<Dia> {
    return this.http.put<Dia>(`${this.baseEndpoint}/actualizar/${dia.id}`, dia)
   }

   public borrarDia(id: number): Observable<any> {
    return this.http.delete(`${this.baseEndpoint}/borrar/${id}`);
   }


}
