import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import localePtBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePtBr);

platformBrowserDynamic().bootstrapModule(AppModule);
