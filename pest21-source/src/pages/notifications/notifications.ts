import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import moment from "moment";
import { NotificationProvider } from '../../providers/notification/notification';
import { NotificationDetailsPage } from '../notification-details/notification-details';
/**
 * Generated class for the NotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


moment.locale("pt-br");

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  notifications: any = [];

  momentView: any = moment;
  constructor(public navCtrl: NavController, public navParams: NavParams, public notifyProvider: NotificationProvider) {
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationsPage');

    this.notifications = await this.notifyProvider.getNotifications();
  }

  openNotification(notification) {
    this.navCtrl.push(NotificationDetailsPage, { notification });
  }

}
