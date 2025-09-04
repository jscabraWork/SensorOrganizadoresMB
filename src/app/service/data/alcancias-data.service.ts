import { Alcancia } from './../../models/alcancia.model';
import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL_PAGOS } from '../../app.constants';
import { Observable } from 'rxjs';
import { MisAlcanciasDto } from '../../models/misalcancias.model';

@Injectable({
  providedIn: 'root'
})
export class AlcanciasDataService extends CommonDataService<Alcancia> {

  protected override baseEndpoint: string = API_URL_PAGOS + '/alcancias'

  protected baseEndpointClientes: string = API_URL_PAGOS + '/clientes'


  constructor(protected override http: HttpClient) {
      super(http);
    }

  // GET /alcancias/admin/{pId}
  getByIdParaAdmin(id: number): Observable<any> {
    return this.http.get(`${this.baseEndpoint}/admin/${id}`);
  }

  // GET /alcancias/admin/cliente/{pClienteId}  
  getByClienteIdParaAdmin(clienteId: string): Observable<any> {
    return this.http.get(`${this.baseEndpoint}/admin/cliente/${clienteId}`);
  }

  // PUT /alcancias/aportar-admin/{pId}?pValor=
  aportarAlcanciaAdmin(id: number, valor: number): Observable<any> {
    const params = new HttpParams().set('pValor', valor.toString());
    return this.http.put(`${this.baseEndpoint}/aportar-admin/${id}`, {}, { params });
  }

  // PUT /alcancias/agregar-ticket/{pId}?pTicketId=
  agregarTicket(alcanciaId: number, ticketId: number): Observable<any> {
    const params = new HttpParams().set('pTicketId', ticketId.toString());
    return this.http.put(`${this.baseEndpoint}/agregar-ticket/${alcanciaId}`, {}, { params });
  }

  // PUT /alcancias/eliminar-ticket/{pId}?pTicketId=
  eliminarTicket(alcanciaId: number, ticketId: number): Observable<any> {
    const params = new HttpParams().set('pTicketId', ticketId.toString());
    return this.http.put(`${this.baseEndpoint}/eliminar-ticket/${alcanciaId}`, {}, { params });
  }

  devolver(id: number): Observable<any> {
    return this.http.get(`${this.baseEndpoint}/devolver/${id}`);
  }

  getAlcanciasByCliente(numeroDocumento: string): Observable<MisAlcanciasDto[]> {
    return this.http.get<MisAlcanciasDto[]>(`${this.baseEndpointClientes}/mis-alcancias/${numeroDocumento}`);
  }

}
