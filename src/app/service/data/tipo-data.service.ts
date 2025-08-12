import { Injectable } from '@angular/core';
import { CommonDataService } from '../commons/common-data.service';
import { Tipo } from '../../models/tipo.model';
import { API_URL_EVENTO } from '../../app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TipoDataService extends CommonDataService<Tipo>{

  protected override baseEndpoint: string = API_URL_EVENTO + '/tipos'

  constructor(protected override http: HttpClient) {
      super(http);
    }


    
}
