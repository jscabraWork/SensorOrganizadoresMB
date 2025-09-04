import { Injectable } from '@angular/core';
import { API_URL_PAGOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { CommonDataService } from '../commons/common-data.service';
import { Ticket } from '../../models/ticket.model';
import { Observable } from 'rxjs';
import { Page } from '../../models/page.mode';
import { MisTicketsDto } from '../../models/mistickets.model';

@Injectable({
  providedIn: 'root'
})
export class TicketDataService extends CommonDataService<Ticket> {

  protected override baseEndpoint: string = API_URL_PAGOS + '/tickets';
  baseEndpointClientes: string = API_URL_PAGOS + '/clientes';

  constructor(http: HttpClient) {
    super(http);
  }

  public listarTickets(ordenId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseEndpoint}/listarTickets/${ordenId}`);
  }

  public buscarPorLocalidadYEstado(pId: number, localidadId: number, pEstado: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseEndpoint}/buscar/${pId}`,
      {
        params: {
          localidadId: localidadId.toString(),
          pEstado: pEstado.toString()
        }
      }
    );
  }

  public listarPorLocalidadYEstado(
    localidadId: number,
    estado: number,
    page: number = 0,
    size: number = 10
  ): Observable<Page<Ticket>> {
    return this.http.get<Page<Ticket>>(
      `${this.baseEndpoint}/listar/estado/${localidadId}`,
      { params: { pEstado: estado.toString(), page: page.toString(), size: size.toString() } }
    );
  }

  public crearTicketsNumerados(
    localidadId: number,
    numeroArriba: number,
    numeroAbajo: number,
    letra: string,
    numerado: boolean,
    personas: number
  ): Observable<any> {
    // Construir los parámetros de la URL
    const params = {
      localidadId:  localidadId,
      numeroArriba: numeroArriba.toString(),
      numeroAbajo: numeroAbajo.toString(),
      letra: letra,
      numerado: numerado.toString(),
      personas: personas.toString()
    };

    return this.http.post<any>(`${this.baseEndpoint}/crear`, null, { params });
  }

  public obtenerHijosDelPalco(ticketId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseEndpoint}/${ticketId}/hijos`);
  }

  public eliminarSiNoTieneOrdenes(ticketId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseEndpoint}/borrar/${ticketId}`);
  }

  public agregarHijos(ticketId: number, cantidad: number): Observable<void> {
    return this.http.post<void>(`${this.baseEndpoint}/${ticketId}/agregar-hijos`, null, {
      params: {
        cantidad: cantidad.toString()
      }
    });
  }

  public editarEstadoTicket(pId: number, estado: number, forzar: boolean = false): Observable<any> {
    const params = {
      estado: estado.toString(),
      forzar: forzar.toString()
    };
    return this.http.put<any>(`${this.baseEndpoint}/estado/${pId}`, null, { params });
  }


  public actualizarTicket(ticket: Ticket, forzar: boolean = false): Observable<Ticket> {
    const params = { forzar: forzar.toString() };
    return this.http.put<Ticket>(`${this.baseEndpoint}/actualizar`, ticket, { params });
  }

  asignarClienteAlTicket(ticket: Ticket, cliente) {
    return this.http.put<any>(`${this.baseEndpoint}/agregar-cliente/${ticket.id}`, cliente)
  }

  enviarQR(ticketId: number): Observable<any> {
    return this.http.put(`${API_URL_PAGOS}/qr/enviar/${ticketId}`, {});
  }

  getMisTicketsByCliente(numeroDocumento: string): Observable<MisTicketsDto[]> {
    return this.http.get<MisTicketsDto[]>(`${this.baseEndpointClientes}/mis-tickets/${numeroDocumento}`);
  }

}
