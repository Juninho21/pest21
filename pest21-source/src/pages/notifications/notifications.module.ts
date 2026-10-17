import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from '../../pipes/pipes.module';
import { NotificationDetailsPage } from '../notification-details/notification-details';
import { NotificationsPage } from './notifications';

@NgModule({
  declarations: [
    NotificationsPage,
    NotificationDetailsPage
  ],
  imports: [
    BrMaskerModule,
    TranslateModule.forChild(),
    IonicPageModule.forChild(NotificationsPage),
    IonicPageModule.forChild(NotificationDetailsPage),
    PipesModule
  ],
})
export class NotificationsPageModule { }
