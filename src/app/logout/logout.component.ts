import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HardcodedAutheticationService } from '../service/hardcoded-authetication.service';
import { AuthService } from '../service/security/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [RouterModule],
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
  }

}
