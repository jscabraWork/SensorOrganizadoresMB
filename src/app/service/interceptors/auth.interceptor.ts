import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


import {catchError} from 'rxjs/operators'
import { throwError}from'rxjs'
import { Router } from "@angular/router";
import { AuthService } from "../security/auth.service";
import { MensajeComponent } from "../../mensaje/mensaje.component";
import { MatDialog } from "@angular/material/dialog";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService, private router: Router, private dialog: MatDialog) { }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log('Error interceptado:', error);
                
                // Verifica si es realmente un error 503 del servidor
            if (error.status === 503 || error.error?.status === 503) {
                this.handleServerError(error);
                return throwError(() => error); // Mantiene el error original
            }
                // Manejo específico de errores de autenticación y autorización
                if (error.status === 401) {
                    this.handleUnauthorizedError();
                } else if (error.status === 403) {
                    this.handleForbiddenError();
                } else if (error.status === 0 || error.status >= 500) {
                    // Errores de conexión o servidor (microservicios caídos)
                    this.handleServerError(error);
                }
                
                return throwError(error);
            })
        );
    }

    private handleUnauthorizedError(): void {
        if (this.auth.isAuthenticated()) {
            const nombreUsuario = this.auth.usuario?.usuario || 'Usuario';
            this.auth.logout();
            this.openMensaje(`Hola ${nombreUsuario}, tu sesión ha expirado`);
            this.router.navigate(['/login']);
        }
    }

    private handleForbiddenError(): void {
        const nombreUsuario = this.auth.usuario?.usuario || 'Usuario';
        this.openMensaje(`Hola ${nombreUsuario}, ocurrio un error, por favor comunicate con un administrador`);
    }

    private handleServerError(error: HttpErrorResponse): void {
        console.error('Error del servidor:', error);
        
        if (error.status === 0) {
            this.openMensaje('Error de conexión. Verifique su conectividad a internet.');
        } else if (error.status >= 500) {
            this.openMensaje('El servicio no está disponible temporalmente. Inténtalo más tarde.');
        }
        
    }

    
    openMensaje(mensajeT: string, openD?: string): void {
        let screenWidth = screen.width;
        let anchoDialog: string = '500px';
        let anchomax: string = '80vw';
        let altoDialog: string = 'auto'; // Agregué 'px'
        
        if (screenWidth <= 600) {
            anchoDialog = '100%';
            anchomax = '100%';
            altoDialog = 'auto';
        }
        
        const dialogRef = this.dialog.open(MensajeComponent, {
            width: anchoDialog,
            maxWidth: anchomax,
            height: altoDialog,
            data: {
                mensaje: mensajeT
            }
        });
    }
}
