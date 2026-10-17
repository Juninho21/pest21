import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";
import { AppVersion } from "@ionic-native/app-version";
import { FirebaseMessaging } from "@ionic-native/firebase-messaging";
import { Network } from "@ionic-native/network";
//import { AppInfo, Pro } from '@ionic-native/pro';
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import { AlertController, LoadingController, MenuController, Nav, Platform } from "ionic-angular";
import moment from 'moment';
import { Observable, Subscription } from "rxjs";
import { CalendarPage } from "../pages/calendar/calendar";
import { HomePage } from "../pages/home/home";
import { ConnectionStatus, NetworkServiceProvider } from "../providers/network-service/network-service";
import { OfflineManagerProvider } from "../providers/offline-manager/offline-manager";
import { AboutPage } from "./../pages/about/about";
import { ClientsPage } from "./../pages/clients/clients";
import { LoginPage } from "./../pages/login/login";
import { ServiceOrderOfflinePoolPage } from "./../pages/service-order-offline-pool/service-order-offline-pool";
import { ApiProvider } from "./../providers/api/api";
@Component({
  templateUrl: "app.html"
})
export class MyApp implements OnInit, OnDestroy {
  rootPage: any = LoginPage;
  @ViewChild("content") nav: Nav;


  subscription: Subscription;

  user: any = {};
  firstRun: boolean = true;
  syncing: boolean = false;
  constructor(
    public platform: Platform,
    //private pro: Pro,
    public appVersion: AppVersion,
    public api: ApiProvider,
    public menuCtrl: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    public storage: Storage,
    public jwtHelper: JwtHelperService,
    public network: Network,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public networkService: NetworkServiceProvider,
    public offlineManager: OfflineManagerProvider,
    private firebaseMessaging: FirebaseMessaging
  ) {

    let currentLanguage = window.navigator.language.split("-")[0] == 'pt' ? 'pt-br' : window.navigator.language.split("-")[0];
    translate.setDefaultLang(currentLanguage);
    translate.use(currentLanguage);


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.backgroundColorByHexString('#000000');
      statusBar.styleLightContent();
      //statusBar.styleDefault();

      splashScreen.hide();

      // Get app info
      /*this.pro.getAppInfo().then((res: AppInfo) => {
        console.log(res)
      }).catch(err => {
        console.log(err);
      })

      // Get live update info
      /*this.pro.deploy().info().then((res: DeployInfo) => {
        console.log(res)
      }).catch(err => {
        console.log(err);
      });*/

      /*this.pro.enableCrashLogging().then(enabled => {
        console.log(enabled);
      }).catch(err => {
        console.log(err);
      });*/

      console.log("PLATFORM READY OK");
      console.log("WINDOW CORDOVA:", (window as any).cordova);
      console.log("WINDOW CAMERA:", (window as any).Camera);
      console.log("WINDOW CONNECTION:", (window as any).Connection);


      this.parseLogin(splashScreen, "browser1");

      this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {

        if (status == ConnectionStatus.Online) {
          setTimeout(() => {
            this.offlineManager.checkForEvents().subscribe();
            this.syncOSs();
          }, 3000)

        } else {
          console.log("CAIU A INTERNET");
        }
      });
      /*
            this.network.onConnect().subscribe(() => {
              if (!this.firstRun) {
                this.syncOSs();
              }
            });
      
            this.network.onDisconnect().subscribe(() => {
              console.log("CAIU A INTERNET");
            });*/

      if (this.api.isConnected) {
        this.firstRun = false;
        if (this.network.type == '4g' || this.network.type == 'wifi') {
          this.syncOSs();
        }

      } else {
        this.firstRun = false;
      }

      const source = Observable.interval(60 * 1000);
      this.subscription = source.subscribe(val => {
        if (this.api.currentUser && this.api.currentUser.id) {
          if (this.network.type == '4g' || this.network.type == 'wifi') {
            this.syncOSs();
            if (this.isCheckingAlarm == false) {
              this.alarmManager();
            }
          }

        }
      });


      if (this.platform.is('android') && !this.platform.is('mobileweb')) {

        this.firebaseMessaging.requestPermission().then(permission => {
          this.firebaseMessaging.getToken().then(token => {
            this.firebaseMessaging.onMessage().subscribe(notification => {
              console.log("ON MESSAGE", notification);

              let key = this.platform.is('ios') ? 'aps' : 'gcm';

              const { title, body } = notification[key];
              const { type } = notification;

              if (!type || type != 'interval') {
                let alert = this.alertCtrl.create({
                  title,
                  message: body,
                  enableBackdropDismiss: false,
                  buttons: ["OK"]
                });
                alert.present();
              } else {
                if (!this.isCheckingAlarm) {
                  this.alarmManager();
                }
              }
            }, err => console.log(err));

            this.firebaseMessaging.onBackgroundMessage().subscribe(notification => {
              console.log("BACKGROUND MESSAGE", notification);
              if (!this.isCheckingAlarm) {
                this.alarmManager();
              }
            }, err => console.log(err));
          }).catch(err => {
            console.log(err);
          });;

        }).catch(err => {
          console.log(err);
        });
      }

      if (this.isCheckingAlarm == false) {
        this.alarmManager();
      }


    });
  }


  ngOnInit() {

  }

  isCheckingAlarm: boolean = false;

  between(x, min, max) {
    return x >= min && x <= max;
  }

  async alarmManager() {
    console.log("START ALARM");
    this.isCheckingAlarm = true;
    let schedule_types = await this.storage.get('schedule_types');
    if (schedule_types && schedule_types.length) {
      let intervalId = schedule_types.find(type => type.is_interval == 1).id;
      let schedulesRequest = await this.api.getSchedule();
      let schedules = await this.storage.get('schedule_' + this.api.currentUser.id);
      if (schedules) {
        let final = schedules.filter(schedule => schedule.schedule_type == intervalId && schedule.read_confirm == 0).filter(schedule => {
          if (moment().isSame(schedule.start_time, 'day') && this.between(moment().diff(schedule.start_time, 'minutes'), -4, 0)) {
            return true;
          }
          return false;
        });

        if (final.length) {

          console.log("ALARM FOUND", final);

          let alert = this.alertCtrl.create({
            title: "Aviso de Intervalo",
            message: "Seu intervalo está prestes a começar. " + moment(final[0].start_time).format('HH:mm'),
            enableBackdropDismiss: false,
            buttons: [
              {
                role: 'confirm',
                text: 'OK, estou ciente',
                handler: () => {

                  schedules.find(book => book.id == final[0].id).read_confirm = 1;
                  this.storage.set('schedule_' + this.api.currentUser.id, schedule_types);
                  let loading = this.loadingCtrl.create({
                    dismissOnPageChange: false,
                  });
                  loading.present().then(() => {

                    this.api.setIntervalRead(final[0].id).subscribe(res => {
                      console.log(res);
                      loading.dismiss();
                      this.isCheckingAlarm = false;
                    });

                  });
                }
              }
            ]
          });

          alert.present();
        } else {
          this.isCheckingAlarm = false;
        }
        console.log(final);
      }
    }

    console.log("END ALARM");
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  syncOSs() {
    if (this.api.syncing == false) {
      console.log("RODOU SYNC", "os_pool_" + this.api.currentUser.id);
      this.api.syncing = true;
      this.storage
        .get("os_pool_" + this.api.currentUser.id)
        .then(osPool => {
          console.log("oss SYNC", osPool);
          if (osPool && osPool.length) {
            let promisses = [];

            osPool.forEach((os, index, object) => {
              if (!os.saved) {
                promisses.push(this.api.saveOs(os));
              } else {
                object.splice(index, 1);
              }
            });

            console.log("PROMESSAS SYNC", osPool);

            this.storage
              .set("os_pool_" + this.api.currentUser.id, osPool)
              .then(newPoll => {
                if (promisses.length == 0) {
                  this.syncing = false;
                } else {
                  Promise.all(promisses)
                    .then(data => {
                      data.forEach((result, index) => {
                        if (result.success) {
                          newPoll.splice(index, 1);
                          this.storage.set(
                            "os_pool_" + this.api.currentUser.id,
                            newPoll
                          );
                        }
                      });

                      this.api.syncing = false;
                    })
                    .catch(err => {
                      console.log(err);
                      this.api.syncing = false;
                    });
                }
              });
          } else {
            setTimeout(() => {
              this.api.syncing = false;
            }, 5000);
          }
        })
        .catch(err => {
          this.api.syncing = false;
        });
    }
  }

  parseLogin(splashScreen, version) {
    this.storage
      .get("access_token")
      .then(token => {
        if (token) {
          this.rootPage = HomePage;
          this.splashScreen.hide();
        } else {
          this.splashScreen.hide();
        }
      })
      .catch(err => {
        this.rootPage = LoginPage;
        this.splashScreen.hide();
      });
  }
  openPage(page) {
    let alert = this.alertCtrl.create({
      title: "Página em desenvolvimento",
      message: "Esta página ainda está em desenvolvimento.",
      enableBackdropDismiss: false,
      buttons: ["OK"]
    });
    alert.present();
  }

  openCalendar() {
    this.nav.push(CalendarPage);
    this.menuCtrl.close();
  }

  openOSPage() {
    this.nav.push(ServiceOrderOfflinePoolPage);
    this.menuCtrl.close();
  }
  openAboutPage() {
    this.nav.push(AboutPage);
    this.menuCtrl.close();
  }

  openCLientsPage() {
    this.nav.push(ClientsPage);
    this.menuCtrl.close();
  }

  logoff() {

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
    });
    loading.present().then(() => {
      this.storage.get('user').then(user => {
        if (user) {
          user.fcm_token = 'logoff';
          this.api.updateUser(user).then(res => {
            console.log(res);
            this.storage.remove("JWT");
            this.storage.remove("access_token");
            this.storage.remove("service_order");
            this.storage.remove("user");
            loading.dismiss();
            this.nav.setRoot(LoginPage);
          }).catch(err => {
            this.storage.remove("JWT");
            this.storage.remove("access_token");
            this.storage.remove("service_order");
            this.storage.remove("user");
            loading.dismiss();
            this.nav.setRoot(LoginPage);
          });
        }

      });
    });
    //this.storage.clear();

  }
}
