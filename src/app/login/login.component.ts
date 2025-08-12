import { Component, OnInit } from '@angular/core';
import { Usuario } from '../service/usuario.model';
import { Router } from '@angular/router';
import { HardcodedAutheticationService } from '../service/hardcoded-authetication.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../service/security/auth.service';
import { MensajeComponent } from '../mensaje/mensaje.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule, 
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  usuario: Usuario
  errorMessage = "Invalid credentials"
  invalidLogin = false;
  constructor(
    private router: Router,
    private autentication: HardcodedAutheticationService,
    private dialog: MatDialog,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.usuario = new Usuario()
  }

  handleLogin(){


    if(this.usuario.usuario==null || this.usuario.contrasena==null){
      //alert('Username o Password vacios');
      this.openMensaje('Username o Password vacios');
      return;
    }

    this.auth.logout();
    this.usuario.usuario=this.usuario.usuario.trim();
    this.auth.login(this.usuario).subscribe({next:response => {

          this.auth.guardarUsuario(response.access_token);
          this.auth.guardarToken(response.access_token);
          let usuario = this.auth.usuario;
    },
      error:error => {
          if(error.status == 400){
            //alert('Usuario o clave incorrectos');
            this.openMensaje('Usuario o clave incorrectos');
          }
      this.usuario = new Usuario();
      this.invalidLogin =true;
  }}
  );


  }

  openMensaje(mensajeT:string, confirmacion: boolean = false): Observable<Boolean> {
          let screenWidth = screen.width;
          let anchoDialog:string = '500px';
          let anchomax:string = '80vw';
          let altoDialog:string = '250';
          if(screenWidth<=600){
            anchoDialog = '100%';
            anchomax = '100%';
            altoDialog = 'auto';
          }
          const dialogRef = this.dialog.open(MensajeComponent, {
            width: anchoDialog,
            maxWidth: anchomax,
            height: altoDialog,
            data:{
              mensaje:mensajeT,
              mostrarBotones: confirmacion
            }
          });
          return dialogRef.afterClosed();
        }

}


