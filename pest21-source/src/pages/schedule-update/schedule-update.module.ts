import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { ComponentsModule } from '../../components/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ScheduleUpdatePage } from './schedule-update';

@NgModule({
  declarations: [
    ScheduleUpdatePage,
  ],
  imports: [

    IonicPageModule.forChild(ScheduleUpdatePage),
    ComponentsModule,
    IonicSelectableModule,
    PipesModule,
    BrMaskerModule,
    TranslateModule.forChild()
  ],
})
export class ScheduleUpdatePageModule { }
