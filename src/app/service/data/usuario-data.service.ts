import { Injectable } from '@angular/core';
import { CommonDataServiceUsuario } from '../commons/common-data-usuario.service';
import { HttpClient } from '@angular/common/http';
import { API_URL_PAGOS, API_URL_USUARIOS } from '../../app.constants';
import { Page } from '../../models/page.mode';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { Cliente } from '../../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioDataService extends CommonDataServiceUsuario<Usuario> {

  protected override baseEndpoint: string = API_URL_USUARIOS
  protected baseEndpointPagos: string = `${API_URL_PAGOS}/clientes`

  constructor(http: HttpClient) {
    super(http)
  }

  public getUsuariosPaginados(pPagina: number, pRoleId: number): Observable<Page<Usuario>> {
    const url = `${this.baseEndpoint}/role/${pRoleId}/${pPagina}`;
    return this.http.get<Page<Usuario>>(url);
  }

  getClientePorId(pId: string) {
    return this.http.get<any>(`${this.baseEndpoint}/${pId}`);
  }

  public buscarUsuarioPorDocumento(roleId: number, documento: string): Observable<Usuario> {
    // Mapeamos el roleId numérico al tipo de usuario para el endpoint
    const tipoUsuario = this.mapRoleIdToTipoUsuario(roleId);
    const url = `${this.baseEndpoint}/${tipoUsuario}/documento/${documento}`;
    return this.http.get<Usuario>(url);
  }

  public buscarPorCorreo(correo: string): Observable<Usuario> {
    const url = `${this.baseEndpoint}/correo/${correo}`;
    return this.http.get<Usuario>(url);
  }

  public buscarPorNumeroDocumento(numeroDocumento: string): Observable<Usuario> {
    const url = `${this.baseEndpointPagos}/buscar/${numeroDocumento}`;
    return this.http.get<Usuario>(url);
  }

  private mapRoleIdToTipoUsuario(roleId: number): string {
    const roleMap = {
      2: 'cliente',
      3: 'organizador',
      4: 'coordinador',
      5: 'analista',
      6: 'promotor',
      7: 'auditor',
      1: 'admin'
    };

    return roleMap[roleId] || 'cliente';
  }

  crearUsuarioConRoles(usuario: Usuario): Observable<any> {
    return this.http.post<any>(
      `${this.baseEndpoint}/crear/usuario`,
      usuario
    );
  }

  actualizarUsuarioConRoles(usuario: Usuario): Observable<any> {
    return this.http.put<any>(
      `${this.baseEndpoint}/actualizar/usuario`,
      usuario
    );
  }

  cambiarEstadoEnabled(numeroDocumento: string): Observable<{ enabled: boolean }> {
    const url = `${this.baseEndpoint}/enabled/${numeroDocumento}`;
    return this.http.put<{ enabled: boolean }>(url, null); 
  }


}
