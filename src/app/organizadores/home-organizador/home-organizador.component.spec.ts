import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeOrganizadorComponent } from './home-organizador.component';

describe('HomeOrganizadorComponent', () => {
  let component: HomeOrganizadorComponent;
  let fixture: ComponentFixture<HomeOrganizadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeOrganizadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeOrganizadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});