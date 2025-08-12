import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonDataService } from '../commons/common-data.service';
import { API_URL_EVENTO } from '../../app.constants';
import { Imagen } from '../../models/imagen.model';

@Injectable({
  providedIn: 'root'
})
export class ImagenesDataService extends CommonDataService<Imagen> {

  protected override baseEndpoint = API_URL_EVENTO + "/imagenes";
  protected override atributoListado = 'evento';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // POST /imagenes/evento/{pIdEvento}
  crearImagenesEvento(files: File[], pIdEvento: number, tipos: number[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    tipos.forEach(tipo => formData.append('tipos', tipo.toString()));
    return this.http.post(`${this.baseEndpoint}/${this.atributoListado}/${pIdEvento}`, formData);
  }

  // GET /imagenes/evento/{pIdEvento}
  getImagenesByEventoId(pIdEvento: number): Observable<Imagen[]> {
    return this.http.get<any>(`${this.baseEndpoint}/${this.atributoListado}/${pIdEvento}`);
  }

  // PATCH /imagenes/editar/{pId}
  editarImagen(pImagen: Imagen, pId: number): Observable<Imagen> {
    return this.http.patch<Imagen>(`${this.baseEndpoint}/editar/${pId}`, pImagen);
  }
}