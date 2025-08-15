import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';


import { OurStoryPage } from './our-story.page';

describe('OurStoryPage', () => {
  let component: OurStoryPage;
  let fixture: ComponentFixture<OurStoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OurStoryPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OurStoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
