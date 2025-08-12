import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Organizador } from '../../models/organizador.model';
import { API_URL_EVENTO, API_URL_USUARIOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';
import { CommonDataServiceUsuario } from '../commons/common-data-usuario.service';
import { Usuario } from '../usuario.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizadorDataService extends CommonDataServiceUsuario<Usuario> {

  protected override baseEndpoint: string = API_URL_USUARIOS + '/organizadores';
  apiOrganizadores =`${API_URL_EVENTO}/organizadores`

  constructor(protected override http: HttpClient) {
      super(http);
    }

    getOrganizadores(){
      return this.http.get<any>(this.apiOrganizadores);
    }
  
}
