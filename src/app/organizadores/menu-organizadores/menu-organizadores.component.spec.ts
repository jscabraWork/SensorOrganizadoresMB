import { ComponentFixture, TestBed } from '@angular/core/testing';

import {MenuOrganizadoresComponent } from './menu-organizadores.component';

describe('MenuOrganizadoresComponent', () => {
  let component: MenuOrganizadoresComponent;
  let fixture: ComponentFixture<MenuOrganizadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuOrganizadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuOrganizadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
