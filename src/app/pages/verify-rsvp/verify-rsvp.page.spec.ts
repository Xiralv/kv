import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyRsvpPage } from './verify-rsvp.page';

describe('VerifyRsvpPage', () => {
  let component: VerifyRsvpPage;
  let fixture: ComponentFixture<VerifyRsvpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyRsvpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
