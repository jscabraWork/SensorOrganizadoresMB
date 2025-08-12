import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { CommonDataService } from '../commons/common-data.service';
import { API_URL_PROMOTORES } from '../../app.constants';
import { Promotor } from '../../models/promotor.model';

@Injectable({
  providedIn: 'root'
})
export class PromotoresDataService extends CommonDataService<Promotor>{

  protected override baseEndpoint = API_URL_PROMOTORES + "/promotores";

  endpointEventos = API_URL_PROMOTORES + "/eventos";
  
  protected override atributoListado= 'evento';

  getPromotorByNumeroDocumento(numeroDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.baseEndpoint}/promotor/${numeroDocumento}`);
  }


  asignarEventos(numeroDocumento: string, eventosId: number[]): Observable<any> {
    return this.http.patch<any>(`${this.baseEndpoint}/asignar-eventos/${numeroDocumento}`, eventosId);
  }

  filtrarPromotores(nombre?: string, numeroDocumento?: string, correo?: string): Observable<any> {
    let params = new HttpParams();
    
    if (nombre && nombre.trim()) {
      params = params.set('nombre', nombre.trim());
    }
    if (numeroDocumento && numeroDocumento.trim()) {
      params = params.set('numeroDocumento', numeroDocumento.trim());
    }
    if (correo && correo.trim()) {
      params = params.set('correo', correo.trim());
    }
    
    return this.http.get<any>(`${this.baseEndpoint}/filtrar`, { params });
  }

 
}
