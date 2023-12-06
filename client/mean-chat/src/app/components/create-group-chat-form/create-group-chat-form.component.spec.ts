import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGroupChatFormComponent } from './create-group-chat-form.component';

describe('CreateGroupChatFormComponent', () => {
  let component: CreateGroupChatFormComponent;
  let fixture: ComponentFixture<CreateGroupChatFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGroupChatFormComponent]
    });
    fixture = TestBed.createComponent(CreateGroupChatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
