import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericUsuario } from './generic-usuario.model';

@Injectable({
  providedIn: 'root'
})
export abstract class CommonDataServiceUsuario <E extends GenericUsuario>{

  protected baseEndpoint:string;
  
  protected atributoListado:string;

  protected headers:HttpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(protected http:HttpClient) { }


  public listar(pRoleName): Observable<any>{
    return this.http.get(`${this.baseEndpoint}/role/${pRoleName}`)
  }

  public listarPorAtributo(idAtributo): Observable<any>{

    return this.http.get(`${this.baseEndpoint}/${this.atributoListado}/${idAtributo}`)
  }

  public getPorId(id): Observable<any>{
    return this.http.get(`${this.baseEndpoint}/${id}`,{headers:this.headers});
  }

  public crear(objeto:E):Observable<any>{
    return this.http.post(this.baseEndpoint,objeto,{headers:this.headers})
  }

  public acceso(id):Observable<any>{
    return this.http.put(`${this.baseEndpoint}/enabled/${id}`,null,{headers:this.headers})
  }

  public editar(e:E): Observable<any>{
  
    return this.http.put(`${this.baseEndpoint}`,e,{headers:this.headers}, 
    
    )
  }
}
