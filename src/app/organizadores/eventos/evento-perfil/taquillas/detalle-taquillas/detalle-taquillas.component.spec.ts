import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleTaquillasComponent } from './detalle-taquillas.component';

describe('DetalleTaquillasComponent', () => {
  let component: DetalleTaquillasComponent;
  let fixture: ComponentFixture<DetalleTaquillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTaquillasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleTaquillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
