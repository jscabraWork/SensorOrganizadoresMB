import { Injectable } from '@angular/core';
import { Generic } from './generic.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class CommonDataService <E extends Generic>{

  protected baseEndpoint:string;
  
  protected atributoListado:string;

  protected headers:HttpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(protected http:HttpClient) { }


  public listar(): Observable<any>{
    return this.http.get(this.baseEndpoint)
  }

  public listarPorAtributo(idAtributo): Observable<any>{

    return this.http.get(`${this.baseEndpoint}/${this.atributoListado}/${idAtributo}`)
  }

  public getPorId(id): Observable<any>{
    return this.http.get(`${this.baseEndpoint}/${id}`,{headers:this.headers});
  }

  public crear(objeto:E):Observable<any>{
    console.log('Creando objeto:', objeto);
    return this.http.post(this.baseEndpoint,objeto,{headers:this.headers})
  }

  public delete(id):Observable<any>{
    return this.http.delete(`${this.baseEndpoint}/${id}`,{headers:this.headers})
  }

  public editar(e:E): Observable<any>{
    return this.http.put(`${this.baseEndpoint}`,e,{headers:this.headers}, 
    
    )

  }

  public editarNoKafka(e:E): Observable<any>{
    return this.http.put(`${this.baseEndpoint}/no-kafka`,e,{headers:this.headers}, 
    
    )
  }

}
