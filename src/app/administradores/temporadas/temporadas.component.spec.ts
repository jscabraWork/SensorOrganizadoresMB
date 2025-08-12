import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TemporadasComponent } from './temporadas.component';

describe('TemporadasComponent', () => {
  let component: TemporadasComponent;
  let fixture: ComponentFixture<TemporadasComponent>;

  // Mock para ActivatedRoute
  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => '1' // o cualquier valor que necesites
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemporadasComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemporadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});