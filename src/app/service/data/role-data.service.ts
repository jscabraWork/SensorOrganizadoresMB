import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { TipoDocumento } from '../../models/tipo-documento.model';
import { API_URL_USUARIOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoleDataService extends CommonDataService<TipoDocumento>{
  protected override baseEndpoint: string = API_URL_USUARIOS + '/role'

  constructor(protected override http: HttpClient) {
      super(http);
    }

}
