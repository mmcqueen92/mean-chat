import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayChatListComponent } from './display-chat-list.component';

describe('DisplayChatListComponent', () => {
  let component: DisplayChatListComponent;
  let fixture: ComponentFixture<DisplayChatListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayChatListComponent]
    });
    fixture = TestBed.createComponent(DisplayChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
