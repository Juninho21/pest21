import { DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { File } from '@ionic-native/file';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HTTP } from '@ionic-native/http';
import { FileOpener } from '@ionic-native/file-opener';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AppVersion } from '@ionic-native/app-version';
import { Camera } from '@ionic-native/camera';
import { DatePicker } from '@ionic-native/date-picker';
import { Device } from '@ionic-native/device';
import { Diagnostic } from '@ionic-native/diagnostic';
import { FirebaseMessaging } from '@ionic-native/firebase-messaging';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Pro } from '@ionic-native/pro';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgCalendarModule } from 'ionic2-calendar';
import { AboutPage } from '../pages/about/about';
import { CalendarPageModule } from '../pages/calendar/calendar.module';
import { ClientDetailsPage } from '../pages/client-details/client-details';
import { IntervalFormPage } from '../pages/interval-form/interval-form';
import { LoginPage } from '../pages/login/login';
import { NotificationsPageModule } from '../pages/notifications/notifications.module';
import { PendingErrorsPageModule } from '../pages/pending-errors/pending-errors.module';
import { ScheduleCreatePage } from '../pages/schedule-create/schedule-create';
import { ScheduleUpdatePageModule } from '../pages/schedule-update/schedule-update.module';
import { PipesModule } from '../pipes/pipes.module';
import { ApiProvider } from '../providers/api/api';
import { NetworkServiceProvider } from '../providers/network-service/network-service';
import { NotificationProvider } from '../providers/notification/notification';
import { OfflineManagerProvider } from '../providers/offline-manager/offline-manager';
import { ComponentsModule } from './../components/components.module';
import { ClientsPage } from './../pages/clients/clients';
import { HomePage } from './../pages/home/home';
import { ProfilePage } from './../pages/profile/profile';
import { DocumentsPage } from './../pages/documents/documents';
import { DocumentFilePage } from './../pages/document-file/document-file';
import { ProceduresPage } from './../pages/procedures/procedures';
import { ProceduresFilePage } from './../pages/procedures-file/procedures-file';
import { TypesDocuments } from './../pages/types-documents/types-documents';
import { ServiceOrderPageModule } from './../pages/service-order/service-order.module';
import { MyApp } from './app.component';
import { DateTimeHelperProvider } from '../providers/date-time-helper/date-time-helper';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      return storage.get('access_token');
    },
    blacklistedRoutes: [
      //'ecolab.advancing.com.br/api/login',
      //'localhost:8000/api/login'
    ],
    whitelistedDomains: [
      'localhost',
      'localhost/api',
      'localhost:8000',
      'localhost:9000',
      '192.168.3.2:8000/api',
      '192.168.3.2/api',
      '192.168.3.2:8000',
      '0.0.0.0',
      '192.168.3.72',
      '192.168.0.101',
      'localhost:8000/api',
      'ecolab.advancing.com.br',
      'ecolab.advancing.com.br/api',
      'sistema.ecolabpest21.com.br',
      'sistema.ecolabpest21.com.br/api',
      'ecolab.advancing.com.br/data',
      'hml.ecolabpest21.com.br'
    ]
  }
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    ClientsPage,
    ClientDetailsPage,
    ScheduleCreatePage,
    ProfilePage,
    DocumentsPage,
    DocumentFilePage,
    ProceduresPage,
    ProceduresFilePage,
    TypesDocuments,
    AboutPage,
    IntervalFormPage
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp),
    NgCalendarModule,
    CalendarPageModule,
    ServiceOrderPageModule,
    NotificationsPageModule,
    PendingErrorsPageModule,
    ScheduleUpdatePageModule,
    IonicSelectableModule,
    HttpClientModule,
    PipesModule,
    AngularDateTimePickerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage]
      }
    }),
    BrMaskerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    ClientsPage,
    ClientDetailsPage,
    ScheduleCreatePage,
    ProfilePage,
    DocumentsPage,
    DocumentFilePage,
    ProceduresPage,
    ProceduresFilePage,
    TypesDocuments,
    AboutPage,
    IntervalFormPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    Network,
    Camera,
    File,
    ApiProvider,
    PhotoViewer,
    DatePipe,
    Geolocation,
    DatePicker,
    AppVersion,
    AndroidPermissions,
    NetworkServiceProvider,
    OfflineManagerProvider,
    TranslatePipe,
    FirebaseMessaging,
    Diagnostic,
    OpenNativeSettings,
    Device,
    Pro,
    NotificationProvider,
    DateTimeHelperProvider,
    InAppBrowser,
    HTTP,
    FileOpener
  ]
})
export class AppModule { }
