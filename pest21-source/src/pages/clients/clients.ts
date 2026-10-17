import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { ClientDetailsPage } from './../client-details/client-details';
import { ScheduleCreatePage } from './../schedule-create/schedule-create';
/**
 * Generated class for the ClientsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-clients',
  templateUrl: 'clients.html',
})
export class ClientsPage {
  clients: any = [];
  clientsCopy: any = [];
  search: any = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage) {
  }



  onInput(event: any) {
    console.log(event);

    if (this.search.length) {
      this.clientsCopy = this.clients.filter(ctrt => ctrt.client.fantasy_name.toLowerCase().includes(this.search.toLowerCase()) || ctrt.client.code.toLowerCase().includes(this.search.toLowerCase()));
    } else {
      this.clientsCopy = this.clients;
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad ClientsPage');

    this.storage.get('clients').then(clients => {
      let filteredClients = [];

      if (clients && clients.length) {
        clients.forEach(client => {
          if (client.client_id != null) {
            filteredClients.push(client);
          }
        });

        this.clients = this.filterClients(clients);
        this.clientsCopy = this.filterClients(clients);
      } else {
        this.clients = [];
      }
    });
  }

  openDetails(client) {
    this.navCtrl.push(ClientDetailsPage, { client });
  }

  openScheduleCreator(client) {
    this.navCtrl.push(ScheduleCreatePage, { client });
  }


  filterClients(clients) {
    //console.log('AQUI', clients);


    if (clients != null && clients.length > 0) {

      clients.forEach(ctrc => {
        if ([1, 4].indexOf(ctrc.status) == -1) {
          ctrc.is_vanished = true
          ctrc.vanished_label = '...'
        } else if (moment(ctrc.validity_end).isBefore()) {
          ctrc.is_vanished = true
          ctrc.vanished_label = 'CONTRATO VENCIDO'
        }
      });

      clients = clients.filter(ctrc => [1, 4].indexOf(ctrc.status) != -1);

      return clients.sort((a, b) => {
        return a.client.fantasy_name.localeCompare(b.client.fantasy_name);
      });
    } else {
      return [];
    }
  }

}
