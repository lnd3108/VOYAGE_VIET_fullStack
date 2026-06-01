import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTourSection } from './home-tour-section';

describe('HomeTourSection', () => {
  let component: HomeTourSection;
  let fixture: ComponentFixture<HomeTourSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeTourSection],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeTourSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
