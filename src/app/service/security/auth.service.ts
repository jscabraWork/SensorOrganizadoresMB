import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Md5 } from 'ts-md5';
import { Usuario } from '../usuario.model';
import { MatDialog } from '@angular/material/dialog';
import { API_URL_AUTH } from '../../app.constants'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _usuario: Usuario;
  private _token: string;

  constructor(private http: HttpClient, private dialog: MatDialog, private router: Router) { }

  public get usuario(): Usuario {
    if(this._usuario != null){
      return this._usuario;
    }  else if (
      this._usuario == null &&
      sessionStorage.getItem('usuario') != null
    ) {
      this._usuario = JSON.parse(sessionStorage.getItem('usuario')) as Usuario;
      return this._usuario;
    }
    return new Usuario();
  }

  public get token(): string {
    if (this._token != null) {
      return this._token;
    } else if (this._token == null && sessionStorage.getItem('token') != null) {
      this._token = sessionStorage.getItem('token');
      return this._token;
    }
    return null;
  }

  login(usuario: Usuario): Observable<any> {
    const urlEndPoint = API_URL_AUTH + '/oauth/token';

    const credenciales = btoa('alltickets.front' + ':' + 'l!Uq!Ujhfzyjd%Mk*a6H');

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + credenciales,
    });

    let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.usuario);
    var md5 = new Md5();

    var contra = md5.appendStr(usuario.contrasena).end().toString();

    params.set('password', contra);

    return this.http.post<any>(urlEndPoint, params.toString(), {
      headers: httpHeaders,
    });
  }

  guardarUsuario(accessToken: string): void {
    let objeto = this.obtenerDatosDelTocken(accessToken);
    this._usuario = new Usuario();
    this._usuario.nombre = objeto.nombre

    this._usuario.usuario = objeto.user_name;

    this._usuario.roles = objeto.authorities;

    this._usuario.numeroDocumento =objeto.cc


    this._usuario.roles.forEach(r=>{
      if(r=="ROLE_ADMIN"){
        this._usuario.tipo='admin'
      }
      else if(r=="ROLE_ORGANIZADOR"){
        this._usuario.tipo='organizador'
      }
    })

    if (this._usuario.tipo == 'admin') {
      this.router.navigate(['administradores/admin', this._usuario.usuario]);
      this.dialog.closeAll();
      sessionStorage.setItem('administrador', this._usuario.usuario);
      sessionStorage.setItem('cc', this._usuario.numeroDocumento);
      sessionStorage.setItem('nombre',this._usuario.nombre);
    }

    else if (this._usuario.tipo == 'organizador') {
      this._usuario.nombre =objeto.nombre
      sessionStorage.setItem('organizador', this._usuario.usuario);
      sessionStorage.setItem('cc',this._usuario.numeroDocumento);
      sessionStorage.setItem('nombre',this._usuario.nombre);
      this.dialog.closeAll();
      
    }
    
     sessionStorage.setItem('usuarioEntidad', JSON.stringify(this._usuario));
  }

  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem('token', accessToken);
  }

  obtenerDatosDelTocken(accessToken: string): any {
    if (accessToken != null) {
      return JSON.parse(atob(accessToken.split('.')[1]));
    } else {
      return null;
    }
  }

  isAuthenticated(): boolean {
    let payload = this.obtenerDatosDelTocken(this.token);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }

  hasRole(role: string): boolean {
    if (
      this.usuario.roles != undefined &&
      this.usuario.roles.length > 0 &&
      this.usuario.roles.includes(role)
    ) {
      return true;
    }
    return false;
  }

  logout(): void {
    this._token = null;
    this._usuario = null;

    sessionStorage.clear();
    sessionStorage.removeItem('usuarioEntidad');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('organizador');
    sessionStorage.removeItem('administrador');
    
    
  }

}
