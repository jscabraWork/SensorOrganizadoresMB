import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Pagina } from '../../models/pagina.model';
import { API_URL_HTML } from '../../app.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaginasDataService extends CommonDataService<Pagina>{

  protected override baseEndpoint = API_URL_HTML + "/paginas";

  protected override atributoListado= 'estado';


  public actualizarEstado(pagina: Pagina): Observable<any> {
  
    // Construir los parámetros de consulta
  const params = new HttpParams()
    .set('pId', pagina.id.toString())
    .set('pEstado', pagina.estado.toString());
  
  return this.http.put(`${this.baseEndpoint}/actualizar-estado`, null, {
    headers: this.headers,
    params: params
  });
}

 public actualizar(pagina: Pagina): Observable<any> {
  return this.http.put(`${this.baseEndpoint}`, pagina, {
    headers: this.headers
  });
}

public actualizarTipo(pagina: Pagina): Observable<any> {
  
    // Construir los parámetros de consulta
  const params = new HttpParams()
    .set('pId', pagina.id.toString())
    .set('pTipoId', pagina.tipo.id.toString());
  
  return this.http.put(`${this.baseEndpoint}/actualizar-tipo`, null, {
    headers: this.headers,
    params: params
  });
}

}
