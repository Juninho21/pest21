import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarPage } from './calendar';
import { NgCalendarModule } from 'ionic2-calendar';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    CalendarPage,
  ],
  entryComponents: [
    CalendarPage
  ],
  imports: [
    IonicPageModule.forChild(CalendarPage),
    TranslateModule.forChild(),
    NgCalendarModule
  ],

})
export class CalendarPageModule {}
