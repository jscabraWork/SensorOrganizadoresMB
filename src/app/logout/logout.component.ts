import { Component, OnInit } from '@angular/core';
import { HardcodedAutheticationService } from '../service/hardcoded-authetication.service';
import { AuthService } from '../service/security/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {

  constructor(
    private autentication: HardcodedAutheticationService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.autentication.logout();
    this.auth.logout();
    this.router.navigate(['/logout']);
  }

}
