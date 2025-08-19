import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaquillasComponent } from './taquillas.component';

describe('TaquillasComponent', () => {
  let component: TaquillasComponent;
  let fixture: ComponentFixture<TaquillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaquillasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaquillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
