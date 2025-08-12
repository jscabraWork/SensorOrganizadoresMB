import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Orden } from '../../models/orden.model';
import { API_URL_PAGOS } from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class OrdenDataService extends CommonDataService<Orden> {


  protected override baseEndpoint: string = API_URL_PAGOS + '/ordenes';
   constructor(protected override http: HttpClient) {
       super(http);
  }

  cambiarEstadoOrden(orden:Orden){
    return this.http.put<Orden>(`${this.baseEndpoint}/estado/${orden.id}?estado=${orden.estado}`,null)
  }

  agregarTicketAorden(ordenId: number,ticketId: number){
    return this.http.post<any>(`${this.baseEndpoint}/agregar/orden/${ordenId}/ticket/${ticketId}`,{})
  }

  eliminarTicketDeOrden(ordenId: number,ticketId: number){
    return this.http.delete<any>(`${this.baseEndpoint}/eliminar/orden/${ordenId}/ticket/${ticketId}`)
  }

  validarContraPtpTrx(pIdOrden){

    return this.http.get<any>(`${this.baseEndpoint}/manejo-orden/${pIdOrden}`)
  }

  ordenesPorClienteId(clienteId: string){
    return this.http.get<any>(`${this.baseEndpoint}/ordenes/cliente/${clienteId}`)
  }

}
