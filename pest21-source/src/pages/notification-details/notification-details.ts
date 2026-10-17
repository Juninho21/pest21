import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import moment from "moment";
import { ApiProvider } from '../../providers/api/api';
import { NotificationProvider } from '../../providers/notification/notification';
/**
 * Generated class for the NotificationDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-notification-details',
  templateUrl: 'notification-details.html',
})
export class NotificationDetailsPage {
  momentView: any = moment;
  notification: any = {};
  constructor(private platform: Platform,
    public navCtrl: NavController,
    public notifyProvider: NotificationProvider,
    public navParams: NavParams, public api: ApiProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationDetailPage');

    this.notification = this.navParams.get("notification");


    if (!this.notification.readed) {
      this.notifyProvider.setNotificationReaded(this.notification.id).subscribe(res => {
        console.log(res);
      });
    }
  }

}
