import { NgModule } from '@angular/core';
import { PestModalSelectorComponent } from './pest-modal-selector/pest-modal-selector';
import { IonicModule } from 'ionic-angular';
import { DeviceCheckerComponent } from './device-checker/device-checker';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [
		PestModalSelectorComponent,
		DeviceCheckerComponent
	],
	entryComponents: [
		PestModalSelectorComponent,
		DeviceCheckerComponent
	],
	imports: [
		IonicModule,
		TranslateModule.forChild()
	],
	exports: [
		PestModalSelectorComponent,
		DeviceCheckerComponent
	]
})
export class ComponentsModule { }
