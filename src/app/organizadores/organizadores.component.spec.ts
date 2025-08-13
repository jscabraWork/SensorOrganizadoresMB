import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizadoresComponent } from './organizadores.component';

describe('OrganizadoresComponent', () => {
  let component: OrganizadoresComponent;
  let fixture: ComponentFixture<OrganizadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});