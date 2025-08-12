import { Injectable } from '@angular/core';
import { API_URL_EVENTO } from '../../app.constants';
import { Venue } from '../../models/venue.model';
import { CommonDataService } from '../commons/common-data.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VenueDataService extends CommonDataService<Venue> {

  protected override baseEndpoint: string = API_URL_EVENTO + '/venues';

  constructor(protected override http: HttpClient) {
        super(http);
  }

  public listarVenuesByCiudadId(ciudadId: number): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseEndpoint}/listarVenues/${ciudadId}`);
  }

  public editarVenue(venue: Venue, ciudadId: number): Observable<Venue> {
    return this.http.put<Venue>(`${this.baseEndpoint}/actualizar/${ciudadId}`, venue);
  }

  public crearVenue(venue: Venue, ciudadId: number): Observable<Venue>{
    return this.http.post<Venue>(`${this.baseEndpoint}/crear/${ciudadId}`, venue);
  }
}
