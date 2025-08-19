import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoPerfilComponent } from './evento-perfil.component';

describe('EventoPerfilComponent', () => {
  let component: EventoPerfilComponent;
  let fixture: ComponentFixture<EventoPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoPerfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventoPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
