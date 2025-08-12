import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Role } from '../../models/rol.model';
import { API_URL_USUARIOS } from '../../app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoDataService extends CommonDataService<Role>{

  protected override baseEndpoint: string = API_URL_USUARIOS + '/tipo-documento'
  
  constructor(protected override http: HttpClient) {
      super(http);
    }
}
