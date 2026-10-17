import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import "rxjs/add/operator/map";
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { catchError, timeout } from 'rxjs/operators';
import { NetworkServiceProvider } from '../network-service/network-service';
import { OfflineManagerProvider } from '../offline-manager/offline-manager';
/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {

  //API_URL:string = 'https://hml.ecolabpest21.com.br/api/';
  
  API_URL: string = 'https://sistema.ecolabpest21.com.br/api/';
  //API_URL: string = 'http://localhost:8000/api/';

  //API_URL: string = 'http://192.168.3.72/api/';

  currentUser: any = {};
  syncing: boolean = false;
  constructor(
    public platform: Platform,
    public http: HttpClient,
    public storage: Storage,
    public network: Network,
    private device: Device,
    public translate: TranslateService,
    private appVersion: AppVersion,
    public networkService: NetworkServiceProvider,
    public offlineManager: OfflineManagerProvider
  ) {
    console.log('Hello ApiProvider Provider');
    console.log('use URL api: '+this.API_URL);

    this.storage.get('user').then(user => {
      if (user) {
        this.currentUser = user;

        if (this.currentUser.language) {
          this.translate.setDefaultLang(this.currentUser.language);
          this.translate.use(this.currentUser.language).subscribe(data => {
            console.log(data)
          }, err => {
            console.log(err)
          })
        }
      }
    });

  }


  isConnected(): boolean {
    let conntype = this.network.type;

    if (this.platform.is('cordova') && !this.platform.is('mobileweb')) {
      if (['3g', '4g', '5g', 'cellular', 'wifi'].indexOf(this.network.type) != -1) {
        return true;
      } else {
        false;
        console.log(this.network.type);
      }
    } else {
      return true;
    }
  }

  getServerTime(): Promise<any> {
    return new Promise((resolve, reject) => {

      if (this.isConnected()) {
        this.http.get(this.API_URL + 'server-time').pipe(
          timeout(5000),
          catchError(e => {
            // do something on a timeout
            return of(null);
          })
        ).subscribe(data => {
          resolve(data);
        }, err => {
          reject(err);
        })

      } else {
        reject(null);
      }

    });
  }

  /*saveUserPlatform() {
    console.log('SAVE PLATFORM')
    if (this.platform.is('cordova')) {

      let payload = {
        platform: this.platform.is('ios') ? 'ios' : 'android',
        platform_version: this.device.version,
        device_model: this.device.manufacturer + " - " + this.device.model,
        ionic_pro_version: process.env.CI_GIT_COMMIT_SHA || 'dev',
        binary_version: null
      }

      this.appVersion.getVersionNumber().then(version => {
        payload.binary_version = version;
        this.api.updateUserPlatform(payload).subscribe(res => {
          console.log(res);
        });
      }).catch(err => {
        console.log(err);
        this.api.updateUserPlatform(payload).subscribe(res => {
          console.log(res);
        });
      })



    }
  }*/

  public login(email, password): Promise<any> {
    return new Promise((resolve, reject) => {

      console.log("VAI LOGIN");
      this.http.post(this.API_URL + 'login', { email, password }).subscribe(data => {
        console.log("VAI LOGIN");
        this.storage.set('access_token', data['data']['token']);
        this.storage.set('user', data['data']['user']);

        this.currentUser = data['data']['user'];

        if (this.currentUser.language) {
          this.translate.setDefaultLang(this.currentUser.language);
          this.translate.use(this.currentUser.language);
        }
        resolve(true);
      }, err => {
        reject(err);
      })

    });

  }

  public sendForgotPassword(email: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + 'forgot-password', { email }).subscribe(data => {
        resolve(data);
      }, err => {
        reject(err);
      })

    });
  }

  public updateUser(user: any): Promise<any> {
    return new Promise((resolve, reject) => {


      if (this.isConnected()) {

        if (this.platform.is('cordova')) {

          user.platform = this.platform.is('ios') ? 'ios' : 'android';
          user.platform_version = this.device.version;
          user.device_model = this.device.manufacturer + " - " + this.device.model;
          user.ionic_pro_version = process.env.CI_GIT_COMMIT_SHA || 'dev';
          user.binary_version = null;


          this.appVersion.getVersionNumber().then(version => {
            user.binary_version = version;

          }).catch(err => {
            console.log(err);
          });

        }


        this.http.post(this.API_URL + 'update-user', user).subscribe(data => {
          if (user.updatePassword) {
            this.login(user.email, user.password).then(loginData => {
              resolve(true);
            });
          } else {
            this.storage.set('user', data['user']).then(() => {
              resolve(data);
            });
          }
        }, err => {
          reject(err);
        });


      } else {
        reject(null);
      }


    });
  }

  public setIntervalRead(schedule_id: any): Observable<any> {
    if (!this.isConnected()) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'update-interval', 'POST', { schedule_id }));
    } else {
      return this.http.post(this.API_URL + 'update-interval', { schedule_id }).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'update-interval', 'POST', { schedule_id });
          }
          throw err.error;
        })
      );
    }
  }


  pendings: any = [];

  public getPestsInfo(): Promise<any> {
    return new Promise((resolve, reject) => {

      this.http.get(this.API_URL + 'data').subscribe((data: any) => {
        let promisses = [
          this.storage.set('pest_groups', data.pest_groups),
          this.storage.set('devices', data.devices),
          this.storage.set('equipments', data.equipments),
          this.storage.set('unconformities', data.unconformities),
          this.storage.set('clients', data.clients),
          this.storage.set('services', data.services),
          this.storage.set('schedule_types', data.schedule_types),
          this.storage.set('attendance_reasons', data.attendance_reasons),
          this.storage.set('noshow_reasons', data.noshow_reasons),
          this.storage.set('pendings', data.pendings),
          this.storage.set('available_audits', data.available_audits),
          this.storage.set('frequencies', data.frequencies),
          this.storage.set('work_schedule', data.work_schedule)


          //this.storage.set('notifications', data.attendance_reasons)
        ];

        this.pendings = data.pendings;

        if (data.language) {
          this.translate.setDefaultLang(data.language);
          this.translate.use(data.language);
        }

        Promise.all(promisses).then(() => {
          resolve(true);
        }).catch(err => {
          reject(err);
        });
      }, err => {
        reject(err);
      });

    })
  }

  public getSchedule(): Promise<any> {
    return new Promise((resolve, reject) => {

      this.storage.get('schedule_' + this.currentUser.id).then(points => {
        let promisses = [];
        if (points && points.length) {
          points.forEach(point => {
            if (!point.id && !point.schedule_types.is_travel) {
              promisses.push(this.saveScheduling(point));
            }
          });
        }

        Promise.all(promisses).then(() => {
          this.http.get(this.API_URL + 'new-schedule').subscribe((data: any) => {
            //console.log(data);
            this.storage.remove('schedule_' + this.currentUser.id).then(() => {
              this.storage.set('schedule_' + this.currentUser.id, data).then(() => {
                resolve(true);
              });
            });

          }, err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
          console.log(err);
        })


      })



    })
  }

  public saveOs(os: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + 'service-order', os).subscribe((data: any) => {
        this.getPestsInfo().then(() => {
          resolve(data);
        });
      }, err => {
        reject(err);
      });
    })
  }

  public osSupport(os: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + 'ossupport', os).subscribe((data: any) => {
        resolve(data);
      }, err => {
        reject(err);
      });
    })
  }

  public getServiceOrders(): Observable<any> {
    /*return new Promise((resolve, reject) => {
      this.http.get(this.API_URL + 'service-orders').subscribe((data: any) => {
        resolve(data.service_orders);
      }, err => {
        reject(err);
      });
    })*/
    return this.http.get(this.API_URL + 'service-orders');

  }

  public saveScheduling(scheduling: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + 'new-scheduling', scheduling).subscribe((data: any) => {
        console.log(data);
        if (data.success) {
          resolve(data);
        } else {
          reject(data);
        }
      }, err => {
        reject(err);
      });
    })
  }


  public saveNonAttendance(nonAttendance: any): Observable<any> {

    if (['3g', '4g', 'wifi'].indexOf(this.network.type) == -1) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'new-non-attendance', 'POST', nonAttendance));
    } else {
      return this.http.post(this.API_URL + 'new-non-attendance', nonAttendance).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'new-non-attendance', 'POST', nonAttendance);
          }
          throw err.error;
        })
      );
    }
  }

  updateSchedule(schedule): Observable<any> {
    return this.http.post(this.API_URL + "schedule-update", { ...schedule })
  }

  deleteScheduling(ids: Array<any>): Observable<any> {

    if (['3g', '4g', 'wifi'].indexOf(this.network.type) == -1) {

      return fromPromise(this.storage.get('schedule_' + this.currentUser.id).then(schedules => {

        let arr = schedules.filter((schedule) => {
          return ids.indexOf(schedule.id) === -1;
        });

        return fromPromise(this.storage.set('schedule_' + this.currentUser.id, arr).then(() => {
          return from(this.offlineManager.storeRequest(this.API_URL + 'schedule-delete', 'POST', { ids }));
        }));
      }));


    } else {
      return this.http.post(this.API_URL + 'schedule-delete', { ids }).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'schedule-delete', 'POST', { ids });
          }
          throw err.error;
        })
      );
    }
  }

  addClientContact(contact: any): Observable<any> {

    if (!this.isConnected()) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'client-contact', 'POST', contact));
    } else {
      return this.http.post(this.API_URL + 'client-contact', contact).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'client-contact', 'POST', contact);
          }
          throw err.error;
        })
      );
    }
  }
  removeClientContact(contact: any): Observable<any> {

    if (!this.isConnected()) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'delete-client-contact', 'POST', contact));
    } else {
      return this.http.post(this.API_URL + 'delete-client-contact', contact).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'delete-client-contact', 'POST', contact);
          }
          throw err.error;
        })
      );
    }
  }

  addClientDevice(device: any): Observable<any> {

    if (!this.isConnected()) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'client-device', 'POST', device));
    } else {
      return this.http.post(this.API_URL + 'client-device', device).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'client-device', 'POST', device);
          }
          throw err.error;
        })
      );
    }
  }
  removeClientDevice(device: any): Observable<any> {

    if (!this.isConnected()) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'delete-client-device', 'POST', device));
    } else {
      return this.http.post(this.API_URL + 'delete-client-device', device).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'delete-client-device', 'POST', device);
          }
          throw err.error;
        })
      );
    }
  }

  updateClientDetails(client: any): Observable<any> {

    if (!this.isConnected()) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'client-details', 'POST', client));
    } else {
      return this.http.post(this.API_URL + 'client-details', client).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'client-details', 'POST', client);
          }
          throw err.error;
        })
      );
    }
  }
}
