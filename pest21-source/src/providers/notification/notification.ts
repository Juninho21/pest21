import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs';
import "rxjs/add/operator/map";
import { from } from 'rxjs/observable/from';
import { catchError, tap } from 'rxjs/operators';
import { ConnectionStatus, NetworkServiceProvider } from '../network-service/network-service';
import { OfflineManagerProvider } from '../offline-manager/offline-manager';

export interface Notification {
  title: string,
  description: string,
  user_id: number,
  id: number,
  created_at: string,
  update_at: string,
  readed: boolean
}

const API_STORAGE_KEY = 'specialkey';

@Injectable()
export class NotificationProvider {



  //API_URL:string = 'https://hml.ecolabpest21.com.br/api/'

  API_URL: string = 'https://sistema.ecolabpest21.com.br/api/';
  //API_URL: string = 'http://localhost:8000/api/';
  //API_URL: string = 'http://192.168.3.72/api/';

  notifications: Notification[] = [];

  constructor(public platform: Platform,
    public http: HttpClient,
    public storage: Storage,
    public network: Network,
    private device: Device,
    public translate: TranslateService,
    private appVersion: AppVersion,
    public networkService: NetworkServiceProvider,
    public offlineManager: OfflineManagerProvider) {
    console.log('Hello NotificationProvider Provider');
  }

  // Save result of API requests
  private async setLocalData(key, data) {
    await this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  // Get cached API result
  private async getLocalData(key) {
    return await this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }

  async setNotifications(notifications: any) {
    this.notifications = notifications;
    return await this.storage.set('notifications', notifications);
  }

  async getNotifications(forceRefresh: any = false) {
    //let notifications = await this.storage.get('notifications');

    console.log('PASSOU AQUI');

    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || forceRefresh == true) {
      // Return the cached data from Storage
      console.log('PASSOU AQUI 1');
      return await from(this.getLocalData('notifications')).toPromise();
    } else {


      console.log('PASSOU AQUI 2');
      // Return real API data and store it locally
      return await this.http
        .get(this.API_URL + "notifications")
        .pipe(
          tap((res: Notification[]) => {
            this.setLocalData('notifications', res);
            this.notifications = res;
          })
        ).toPromise()
    }

  }

  async getNotification(id) {
    return this.notifications.find(ntf => ntf.id == id);
  }

  setNotificationReaded(notificationID, forceRefresh = false): Observable<any> {
    let index = this.notifications.findIndex(ntfy => ntfy.id == notificationID);
    this.notifications[index].readed = true;

    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || forceRefresh == true) {
      return from(this.offlineManager.storeRequest(this.API_URL + 'update-notification', 'POST', { notificationID }));
    } else {
      return this.http.post(this.API_URL + 'update-notification', { notificationID }).pipe(
        catchError(err => {
          console.log("REQUEST", err);
          if (err.status != 409) {
            this.offlineManager.storeRequest(this.API_URL + 'update-notification', 'POST', { notificationID });
          }
          throw err.error;
        })
      );
    }

  }

}
