import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Cupon } from '../../models/cupon.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL_PAGOS } from '../../app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuponDataService extends CommonDataService<Cupon>{


  protected override baseEndpoint: string = API_URL_PAGOS + '/cupones';
  
  protected override atributoListado: string = 'tarifa';

  constructor(protected override http: HttpClient) {
    super(http)
   }

  actualizar(cuponId: string, cupon: Cupon): Observable<any> {
    const params = new HttpParams().set('pCuponId', cuponId);
    return this.http.put(`${this.baseEndpoint}/editar`, cupon, { 
      params,
      headers: this.headers 
    });
  }


}
