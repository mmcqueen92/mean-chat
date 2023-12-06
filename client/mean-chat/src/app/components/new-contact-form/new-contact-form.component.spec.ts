import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewContactFormComponent } from './new-contact-form.component';

describe('NewContactFormComponent', () => {
  let component: NewContactFormComponent;
  let fixture: ComponentFixture<NewContactFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewContactFormComponent]
    });
    fixture = TestBed.createComponent(NewContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
