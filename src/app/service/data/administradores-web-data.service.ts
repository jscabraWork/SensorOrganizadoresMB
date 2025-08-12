import {  API_URL_USUARIOS } from './../../app.constants';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonDataServiceUsuario } from '../commons/common-data-usuario.service';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AdministradoresWebDataService extends CommonDataServiceUsuario<Usuario>{

  
  protected override baseEndpoint=`${API_URL_USUARIOS}/admin`;


  constructor(protected override http: HttpClient) {
    super(http);
  }

}
