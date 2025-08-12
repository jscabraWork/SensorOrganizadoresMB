import { Pagina } from './../../models/pagina.model';
import { Injectable } from '@angular/core';
import { Recurso } from '../../models/pagina.model';
import { CommonDataService } from '../commons/common-data.service';
import { API_URL_HTML } from '../../app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecursosDataService extends CommonDataService<Recurso>{

  protected override baseEndpoint = API_URL_HTML + "/recursos";

  protected override atributoListado= 'pagina';


  subir(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseEndpoint}/crear`, formData);
  }

  //Crea el recurso no subiendo el archivo sino solo con una url existente
  crearUrl(recurso: Recurso, paginaId: number): Observable<any> {
    return this.http.post(`${this.baseEndpoint}/crear-url/${paginaId}`, recurso);
  }

}
