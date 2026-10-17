import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { FirebaseMessaging } from '@ionic-native/firebase-messaging';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, MenuController, NavController, NavParams, Platform } from 'ionic-angular';
import moment from 'moment';
import { NotificationProvider } from '../../providers/notification/notification';
import { NotificationsPage } from '../notifications/notifications';
import { PendingErrorsPage } from '../pending-errors/pending-errors';
import { ApiProvider } from './../../providers/api/api';
import { CalendarPage } from './../calendar/calendar';
import { ClientsPage } from './../clients/clients';
import { LoginPage } from './../login/login';
import { ProfilePage } from './../profile/profile';
//import { DocumentsPage } from './../documents/documents';
import { ServiceOrderPage } from './../service-order/service-order';
import { TypesDocuments } from './../types-documents/types-documents';

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {

  //this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
  //this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
  permissionList: any = [
    this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
    this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
    this.androidPermissions.PERMISSION.ACCESS_NETWORK_STATE,
    this.androidPermissions.PERMISSION.ACCESS_WIFI_STATE,
    this.androidPermissions.PERMISSION.CAMERA,
  ];
  
  warningCard: boolean = false;
  notGiven: any = [];
  translatedContent: any = {};
  notifications: any = [];
  pendings: any = [];
  platformVersion:number;
  os: any = {};
  constructor(
    public translate: TranslateService,
    public menu: MenuController,
    public androidPermissions: AndroidPermissions,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public api: ApiProvider,
    public platform: Platform,
    public notification: NotificationProvider,
    public storage: Storage,
    private firebaseMessaging: FirebaseMessaging,
    public loadingCtrl: LoadingController) {
    this.menu.enable(true);

    if (this.platform.is('android')) {
      this.platformVersion = parseInt(this.platform.version().str);
      console.log("Android versão: "+this.platformVersion);
    }  

  }


  openNotifications() {
    this.navCtrl.push(NotificationsPage);
  }

  openPendings() {
    this.navCtrl.push(PendingErrorsPage, { pedings: this.api.pendings });
  }
  getLanguage() {
    this.translate.get(
      'home').subscribe(res => {
        console.log(res);
        this.translatedContent = res;
      });
  }

  missingPermission: boolean = false;

  async update() {

    await this.ionViewDidLoad();
    await this.ionViewDidEnter();

  }

  async requestAllPermissions() {

    let permissionPromises = [];

    try {

      // ANDROID <= 10
      if (this.platformVersion < 11) {

        this.permissionList.push(
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        );

        this.permissionList.push(
          this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
        );

        console.log("Android <= 10: valida WRITE/READ_EXTERNAL_STORAGE");

      }

      // ANDROID 11 e 12
      else if (this.platformVersion < 13) {

        this.permissionList.push(
          this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
        );

        console.log("Android 11-12: valida READ_EXTERNAL_STORAGE");

      }

      // ANDROID 13+
      else {
        console.log("Android 13+: nenhuma permissão de mídia necessária");
      }

      // Verifica permissões listadas
      this.permissionList.forEach(permission => {
        permissionPromises.push(
          this.androidPermissions.checkPermission(permission)
        );
      });

      let returnOfPermission = await Promise.all(permissionPromises);

      returnOfPermission.forEach(callback => {
        if (callback && !callback.hasPermission) {
          this.missingPermission = true;
        }
      });

    } catch (err) {
      console.log(err);
    }

    if (this.missingPermission === true) {

      let alert = this.alertCtrl.create({
        title: this.translatedContent.grant_permissions,
        message: this.translatedContent.grant_permissions_message,
        enableBackdropDismiss: false,
        buttons: [
          {
            text: "OK",
            handler: () => {

              this.androidPermissions.requestPermissions(this.permissionList)
                .then(response => {

                  console.log(response);

                  this.permissionList.forEach(permission => {

                    this.androidPermissions.checkPermission(permission)
                      .then(hasPermission => {

                        if (!hasPermission) {
                          this.androidPermissions.requestPermission(permission)
                            .catch(err => this.notGiven.push(permission));
                        }

                      })
                      .catch(err => this.notGiven.push(permission));

                  });

                })
                .catch(err => console.log(err));

            }
          }
        ]
      });

      alert.present();
    }
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');


    this.translate.onLangChange.subscribe(res => {
      this.getLanguage();
    });

    this.getLanguage();



    if (this.api.isConnected()) {
      let loading = this.loadingCtrl.create({
        dismissOnPageChange: false,
        content: this.translatedContent.loading_content
      });
      loading.present().then(() => {

        let promisses = [];

        promisses.push(this.api.getPestsInfo());
        promisses.push(this.api.getSchedule());

        Promise.all(promisses).then(results => {
          loading.dismiss();
          this.requestAllPermissions();
        }).catch(err => {
          loading.dismiss();
          if (err.status == 401) {
            this.navCtrl.setRoot(LoginPage);
            this.storage.clear();
          } else {
            this.requestAllPermissions();
          }
        });
      });


    } else {
      console.log('Sem Conexão com internet');
    }
  }

  async ionViewDidEnter() {
    this.storage.get('service_order').then(os => {
      if (os) {
        this.warningCard = true;
        this.os = os;
      } else {
        this.warningCard = false;
      }
    }).catch(err => {
      this.warningCard = false;
    });

    if (this.platform.is('cordova')) {

      this.firebaseMessaging.getToken().then(token => {

        this.storage.get('user').then(user => {
          if (user) {
            user.fcm_token = token;
            this.api.updateUser(user).then(res => {
              console.log(res);
            }).catch(err => console.log(err));
          }
        });
      }).catch(err => console.log(err));
    } else {
      this.storage.get('user').then(user => {
        if (user) {
          this.api.updateUser(user).then(res => {
            console.log(res);
          }).catch(err => console.log(err));
        }
      });
    }


    this.notifications = await this.notification.getNotifications();
    this.notifications = this.notifications.filter(ntf => !ntf.readed);
  }

  openCalendar() {
    this.navCtrl.push(CalendarPage);
  }
  openClients() {
    this.navCtrl.push(ClientsPage);
  }

  openProfile() {
    this.navCtrl.push(ProfilePage);
  }

  openDocuments() {
    this.navCtrl.push(TypesDocuments);
  }

  openPage() {

    this.translate.get(['dev_title', 'dev_message']).subscribe(res => {


      let alert = this.alertCtrl.create({
        title: res.dev_title,
        message: res.dev_message,
        enableBackdropDismiss: false,
        buttons: ['OK']
      });
      alert.present();

    });
  }

  continueOS() {
    //this.navCtrl.push(ServiceOrderPage);
    this.navCtrl.push(ServiceOrderPage, { os: this.os });
  }

  ngOnInit() {

  }

}
