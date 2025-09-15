import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Transaccion } from '../../models/transaccion.model';
import { API_URL_PAGOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesDataService extends CommonDataService<Transaccion>{

   protected override baseEndpoint: string = API_URL_PAGOS+"/transacciones"

  constructor(http: HttpClient) {
    super(http)
  }

  getTransaccionesByFiltro(
    numeroDocumento?: string,
    correo?: string,
    fechaInicio?: string,
    fechaFin?: string,
    estado?: number,
    metodo?: number,
    metodoNombre?: string,
    page: number = 0,
    size: number = 10
  ): any {
    let params: any = { page, size };
    
    if (numeroDocumento) params.numeroDocumento = numeroDocumento;
    if (correo) params.correo = correo;
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (estado !== undefined) params.estado = estado;
    if (metodo !== undefined) params.metodo = metodo;
    if (metodoNombre) params.metodoNombre = metodoNombre;
    
    return this.http.get(`${this.baseEndpoint}/filtro`, { params });
  }

}
