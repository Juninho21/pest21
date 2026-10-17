import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { ApiProvider } from '../../providers/api/api';
import { CalendarPage } from '../calendar/calendar';
import { HomePage } from '../home/home';
import { ScheduleCreatePage } from '../schedule-create/schedule-create';

/**
 * Generated class for the PendingErrorsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pending-errors',
  templateUrl: 'pending-errors.html',
})
export class PendingErrorsPage {

  pendings: any = [];

  momentView: any = moment;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, public storage: Storage) {
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationsPage');

    let pend = await this.api.pendings;
    console.log(pend);
    pend.sort((a, b) => a.client.social_name.localeCompare(b.client.social_name));
    this.pendings = pend;
  }


  async goToSchedule(pending: any) {
    if (pending.type == 'less') {

      let contracts = await this.storage.get('clients');
      let contract = contracts.find(crt => crt.client.id == pending.client.id);

      if (contract) {
        this.openScheduleCreator(contract);
      }
    } else {
      this.navCtrl.setPages([{ page: HomePage }, { page: CalendarPage }])
    }
  }

  openScheduleCreator(client) {
    this.navCtrl.push(ScheduleCreatePage, { client });
  }

}
