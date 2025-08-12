import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdenesComponent } from './ordenes.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('OrdenesComponent', () => {
  let component: OrdenesComponent;
  let fixture: ComponentFixture<OrdenesComponent>;

  const mockActivatedRoute = {
    parent: {
      paramMap: of(new Map([['nombre', 'test-user']]))
    }
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenesComponent,RouterTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar con los valores predeterminados', () => {
    expect(component.extender).toBeTrue();
    expect(component.nombre).toEqual('test-user');
  });
});
