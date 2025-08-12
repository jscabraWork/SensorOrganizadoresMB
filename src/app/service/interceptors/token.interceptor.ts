import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../security/auth.service"; 

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        let token = this.auth.token;
        if(token!=null){
            const authReq = req.clone({      
                headers: req.headers.set('Authorization', 'Bearer ' + token)
           });
           return next.handle(authReq);
        }
        return next.handle(req);
    }
}