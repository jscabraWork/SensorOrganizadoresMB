import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarClienteTicketComponent } from './agregar-cliente-ticket.component';

describe('AgregarClienteTicketComponent', () => {
  let component: AgregarClienteTicketComponent;
  let fixture: ComponentFixture<AgregarClienteTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarClienteTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarClienteTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
