
import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Ciudad } from '../../models/ciudad.model';
import { API_URL_EVENTO } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CiudadDataService extends CommonDataService<Ciudad> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/ciudades';

  constructor(protected override http: HttpClient) {
      super(http);
    }

    public listarCiudades(): Observable<Ciudad[]> {
        return this.http.get<Ciudad[]>(`${this.baseEndpoint}/listarCiudades`);
      }

    public editarCiudad(ciudad: Ciudad): Observable<Ciudad> {
        return this.http.put<Ciudad>(`${this.baseEndpoint}/actualizar/${ciudad.id}`, ciudad);
    }

    public crearCiudad(ciudad: Ciudad): Observable<Ciudad>{
      return this.http.post<Ciudad>(`${this.baseEndpoint}/crear`, ciudad);
    }

}
