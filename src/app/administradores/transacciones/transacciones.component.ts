import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-transacciones',
  imports: [
          CommonModule,
          RouterModule,
          FormsModule
        ],
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.scss'
})
export class TransaccionesComponent implements OnInit{

  loading = false;
  cargando:boolean
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {

  }
}
