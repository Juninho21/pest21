import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from '../../pipes/pipes.module';
import { PendingErrorsPage } from './pending-errors';

@NgModule({
  declarations: [
    PendingErrorsPage,
  ],
  imports: [
    IonicPageModule.forChild(PendingErrorsPage),
    PipesModule

  ],
})
export class PendingErrorsPageModule { }
