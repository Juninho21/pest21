import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ApiProvider } from '../../providers/api/api';

/**
 * Generated class for the ClientDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-client-details',
  templateUrl: 'client-details.html',
})
export class ClientDetailsPage {
  client: any = {};
  available_audits: any = [];
  adding_contact: boolean = false;
  adding_device: boolean = false;
  adding: any = {};
  addingDevice: any = {};

  available_devices: any = [];
  disabled_devices: any = [];
  available_frequencies: any = [];
  constructor(
    public navCtrl: NavController,
    public storate: Storage,
    public api: ApiProvider,
    public navParams: NavParams,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
  ) {
    this.client = this.navParams.get('client');
    console.log(this.client);

  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad ClientDetailsPage');
    let availableAudits = await this.storage.get('available_audits');

    this.available_audits = availableAudits.map(audit => {

      return {
        audit_id: audit.id,
        audit_type: audit,
        name: audit.name,
        client_id: this.client.client_id,
        company_id: this.client.company_id,
        id: null
      }
    });

    console.log(this.available_audits);

    this.available_devices = await this.storage.get('devices');
    this.disabled_devices = this.client.client.client_devices.map(item => {
      return item.device_type;
    });
    console.log(this.available_devices);
    //this.available_devices = this.available_devices.sort((a, b) => b.name.localCompare(a.name));
    this.available_frequencies = await this.storage.get('frequencies');

    this.client.client.client_audits = this.client.client.client_audits.map(audit => {
      audit.name = audit.audit_type.name;
      return audit;
    })



    console.log('WHAT', this.client.client.client_audits);
  }


  async addContact() {
    let addContact = {
      cellphone: this.adding.cellphone,
      client_id: this.client.client_id,
      email: this.adding.email,
      id: null,
      name: this.adding.name,
      role: null,
      signature: null,
      telephone: this.adding.telephone,
    }

    this.client.client.contacts.push(addContact);

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: "Adicionando contato"
    });


    await loading.present();


    await this.api.addClientContact(addContact).toPromise();


    let clients = await this.storage.get('clients');

    let indexFind = clients.findIndex(clt => clt.client_id == this.client.client_id);

    clients[indexFind] = this.client;

    await this.storage.set('clients', clients);

    this.adding = {};
    this.adding_contact = false;

    await loading.dismiss();


  }

  removeContact(index: number, contact: any) {

    let alert = this.alertCtrl.create({
      title: 'Remover Contato',
      message: 'Tem certeza que deseja remover esse contato?',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            this.client.client.contacts.splice(index, 1);

            let func = async () => {
              let loading = this.loadingCtrl.create({
                dismissOnPageChange: false,
                content: "Removendo contato"
              });

              await loading.present();


              if (contact.id) {
                await this.api.removeClientContact(contact).toPromise();
              }

              let clients = await this.storage.get('clients');

              let indexFind = clients.findIndex(clt => clt.client_id == this.client.client_id);

              clients[indexFind] = this.client;

              await this.storage.set('clients', clients);

              await loading.dismiss();
            }

            func();



          }
        }
      ]
    });
    alert.present();

  }

  auditsChange(event) {
    console.log(event);
  }

  async addDevice() {
    let addDevice = {
      "company_id": this.client.company_id,
      "client_id": this.client.client_id,
      "device_id": this.addingDevice.device_type.id,
      "amount": this.addingDevice.amount,
      "frequency_id": this.addingDevice.frequency_type.id,
      "comments": this.addingDevice.comments,
      "status": 1,
      "device_type": this.addingDevice.device_type,
      "frequency_type": this.addingDevice.frequency_type
    }

    this.client.client.client_devices.push(addDevice);

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: "Adicionando dispositivo"
    });


    await loading.present();

    await this.api.addClientDevice(addDevice).toPromise();

    let clients = await this.storage.get('clients');

    let indexFind = clients.findIndex(clt => clt.client_id == this.client.client_id);

    clients[indexFind] = this.client;

    await this.storage.set('clients', clients);

    this.addingDevice = {};
    this.adding_device = false;


    this.disabled_devices = this.client.client.client_devices.map(item => {
      return item.device_type;
    });

    await loading.dismiss();
  }

  removeDevice(index: number, device: any) {
    let alert = this.alertCtrl.create({
      title: 'Remover Dispositivo',
      message: 'Tem certeza que deseja remover esse dispositivo?',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            this.client.client.client_devices.splice(index, 1);
            let func = async () => {
              let loading = this.loadingCtrl.create({
                dismissOnPageChange: false,
                content: "Removendo dispositivo"
              });

              await loading.present();


              if (device.id) {
                await this.api.removeClientDevice(device).toPromise();
              }

              let clients = await this.storage.get('clients');

              let indexFind = clients.findIndex(clt => clt.client_id == this.client.client_id);

              clients[indexFind] = this.client;

              await this.storage.set('clients', clients);

              this.addingDevice = {};
              this.adding_device = true;

              await loading.dismiss();

              this.adding_device = false;

              this.disabled_devices = this.client.client.client_devices.map(item => {
                return item.device_type;
              });
            }

            func().then(() => {
              console.log("DONE");
              this.disabled_devices = this.client.client.client_devices.map(item => {
                return item.device_type;
              });
            }).catch(err => {
              console.log("ERR", err);
            });
          }
        }
      ]
    });
    alert.present();

  }

  async save(form: NgForm) {

    console.log(this.client.client.client_audits);

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: "Atualizando Dados"
    });

    await loading.present();

    let client = {
      client_id: this.client.client_id,
      company_id: this.client.company_id,
      audits: this.client.client.client_audits,
      peculiarity_description: this.client.client.peculiarity_description
    }


    await this.api.updateClientDetails(client).toPromise();

    let clients = await this.storage.get('clients');


    let indexFind = clients.findIndex(clt => clt.client_id == this.client.client_id);

    clients[indexFind] = this.client;

    await this.storage.set('clients', clients);

    this.addingDevice = {};
    this.adding_device = false;


    await loading.dismiss();

    form.reset(form.value);

    let alert = this.alertCtrl.create({
      title: 'Sucesso',
      message: 'Dados adicionais salvos com sucesso',
      enableBackdropDismiss: false,
      buttons: ['OK']
    });
    await alert.present();

  }



  startAddContact() {
    this.adding_contact = !this.adding_contact;

    if (this.adding_contact == false) {
      this.adding = {};
    }
  }

  startAddDevice() {
    this.adding_device = !this.adding_device;
    if (this.adding_device == false) {
      this.addingDevice = {};
    }
  }

  portChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
  }



}
