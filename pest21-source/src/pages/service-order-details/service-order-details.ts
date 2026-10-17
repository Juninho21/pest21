import { Component } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import moment from 'moment';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
import { ClientDetailsPage } from '../client-details/client-details';
import { HomePage } from '../home/home';
import { ProfilePage } from '../profile/profile';
import { ScheduleUpdatePage } from '../schedule-update/schedule-update';
import { ServiceOrderPage } from '../service-order/service-order';
import { ApiProvider } from './../../providers/api/api';
import { ServiceOrderNonAttendancePage } from './../service-order-non-attendance/service-order-non-attendance';
/**
 * Generated class for the ServiceOrderDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-details',
  templateUrl: 'service-order-details.html',
})
export class ServiceOrderDetailsPage {

  view: boolean = false;
  scheduling: any = {};
  storageOs: any = {};
  buttonLabel: String = 'os_details.start_os';

  schedule_types: any = [];
  services: any = [];


  schedule_type_name: any = "";
  service_name: any = "";
  translatedContent: any = {};
  canStart: boolean = true;
  disableEdit: boolean = false;
  cantDelete: boolean = false;
  constructor(
    private diagnostic: Diagnostic,
    public networkService: NetworkServiceProvider,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public platform: Platform,
    private geolocation: Geolocation,
    private openNativeSettings: OpenNativeSettings,
    public api: ApiProvider) {

    if (this.navParams.get('view')) {
      this.view = this.navParams.get('view');
    }

    if (this.navParams.get('disableEdit')) {
      this.disableEdit = this.navParams.get('disableEdit');
    }
    if (this.navParams.get('scheduling')) {
      this.scheduling = this.navParams.get('scheduling');
      console.log(this.scheduling); //schedule_contract.client.chain.audit
    }
    translate.onLangChange.subscribe(res => {
      this.getLanguage();
    });
    this.getLanguage();



  }




  async checkRequired() {


    let isLocationEnabled = await this.diagnostic.isLocationEnabled().catch(err => console.log(err));
    let isWifiEnabled: boolean = await this.diagnostic.isWifiAvailable().catch(err => console.log(err));
    let isMobileDataEnabled, isAutomaticTimeEnabled;

    //console.log('checkRequired isLocationEnabled: ' + isLocationEnabled);
    //console.log('checkRequired isLocationEnabled: ' + isWifiEnabled);

    //if (window['CheckMobileDataEnabled']) {
      //isMobileDataEnabled = await window['CheckMobileDataEnabled']['isMobileDataEnabled']();
      //isAutomaticTimeEnabled = await window['CheckMobileDataEnabled']['isAutomaticTimeChecked']();
      isMobileDataEnabled = true;
      isAutomaticTimeEnabled = true;
    //}

    //.log(isLocationEnabled, isWifiEnabled, isMobileDataEnabled, isAutomaticTimeEnabled);
  }

  getLanguage() {
    this.translate.get(
      'os_details').subscribe(res => {
        //console.log(res);
        this.translatedContent = res;
      });
  }

  currentService: any;
  getService(id) {
    this.services.forEach(service => {
      if (service.id == id) {
        this.currentService = service;
        this.service_name = service.name;
      }
    });
  }
  currentType: any;
  getType(id) {
    this.schedule_types.forEach(type => {
      if (type.id == id) {
        this.currentType = type;
        this.schedule_type_name = type.name;
      }
    });
  }

  contracts: any = [];
  async ionViewDidEnter() {
    this.contracts = await this.storage.get('clients');
    this.scheduling.contract = this.contracts.find(contract => contract.id == this.scheduling.contract_id);

    //console.log(this.scheduling);
  }

  convertMinsToHrsMins = (mins) => {
    let h: any = Math.floor(mins / 60);
    let m: any = mins % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderDetails');

    this.storage.get('schedule_types').then(schedule_types => {
      this.schedule_types = schedule_types;
    });

    this.storage.get('services').then(services => {
      this.services = services;
    });


    this.checkRequired();



    this.storage.get('service_order').then(os => {
      if (this.navParams.get('scheduling')) {
        this.scheduling = this.navParams.get('scheduling');
      } else {
        this.scheduling = os.data;
      }

      //console.log("SCHEDULING", this.scheduling);

      //console.log("É ou não", moment(this.scheduling.start_time).isSameOrBefore(new Date(), 'day'));
      this.canStart = moment(this.scheduling.start_time).isSameOrBefore(new Date(), 'day');

      this.getService(this.scheduling.schedule_service);
      this.getType(this.scheduling.schedule_type);


      if (this.currentType.is_contract) {
        this.cantDelete = true;
      }


      if (this.view == false) {
        this.storageOs = os;
        if (os) {
          if (this.storageOs.id == this.scheduling.id) {
            this.buttonLabel = 'os_details.continue_os';
            this.view = false;
          } else {
            this.view = true;
          }

        } else {
          this.view = false;
        }


      }


    }).catch(err => {
      this.view = false;
    })

  }

  async nonAttendance() {

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      content: 'Enviando...'
    });

    await loading.present();

    if (this.api.isConnected) {
      await loading.dismiss();
      this.navCtrl.push(ServiceOrderNonAttendancePage, { scheduling: this.scheduling });
    } else {
      let alert = this.alertCtrl.create({
        title: this.translatedContent.attention,
        message: this.translatedContent.internet_warning,
        enableBackdropDismiss: false,
        buttons: ['OK']
      });
      await loading.dismiss()
      await alert.present();
    }
  }

  async startService() {


    if (this.storageOs && this.storageOs.id == this.scheduling.id) {
      this.navCtrl.push(ServiceOrderPage);
    } else {

      let loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
        content: 'Verificando requisitos...'
      });

      await loading.present()

      let isLocationEnabled = await this.diagnostic.isLocationEnabled().catch(err => console.log(err));
      let isWifiEnabled: boolean = await this.diagnostic.isWifiAvailable().catch(err => console.log(err));
      let isMobileDataEnabled, isAutomaticTimeEnabled;

      //console.log("window['CheckMobileDataEnabled'] " + window['CheckMobileDataEnabled']);

      //if (window['CheckMobileDataEnabled']) {
        //isMobileDataEnabled = await window['CheckMobileDataEnabled']['isMobileDataEnabled']();
        //isAutomaticTimeEnabled = await window['CheckMobileDataEnabled']['isAutomaticTimeChecked']();
        isMobileDataEnabled = true;
        isAutomaticTimeEnabled = true;
      //}

      //console.log(isLocationEnabled, isWifiEnabled, isMobileDataEnabled, isAutomaticTimeEnabled);

      let errorMessage = "";

      let translatePermissions = await this.translate.get('permissions').toPromise();

      //console.log("TRANS", translatePermissions);


      if (!this.platform.is('mobileweb')) {

        if (this.api.currentUser && [1, 2].indexOf(this.api.currentUser.company_id) != -1) {
          if (!isLocationEnabled || !isWifiEnabled /*|| !isMobileDataEnabled || !isAutomaticTimeEnabled*/) {
            errorMessage = translatePermissions.error_message;

            let buttons = [];


            if (!isLocationEnabled) {
              buttons.push({
                text: translatePermissions.enable_location,
                handler: () => {
                  this.diagnostic.switchToLocationSettings();
                  return;
                }
              })
            }

            if (!isWifiEnabled) {
              buttons.push({
                text: translatePermissions.enable_wifi,
                handler: () => {
                  this.diagnostic.switchToWifiSettings();
                  return;
                }
              })
            }

            if (!isMobileDataEnabled) {
              buttons.push({
                text: translatePermissions.enable_mobile_data,
                handler: () => {
                  this.openNativeSettings.open('network');
                  return;
                }
              })
            }

            if (!isAutomaticTimeEnabled) {
              buttons.push({
                text: translatePermissions.enable_auto_time,
                handler: () => {
                  this.openNativeSettings.open('date');
                  return;
                }
              })
            }

            let alert = this.alertCtrl.create({
              title: translatePermissions.error_title,
              message: errorMessage,
              enableBackdropDismiss: false,
              buttons
            });
            loading.dismiss()
            alert.present();

            return;

          } else if (this.api.currentUser && !this.api.currentUser.signature) {
            let alert = this.alertCtrl.create({
              title: translatePermissions.error_title,
              message: translatePermissions.register_signature_error,
              enableBackdropDismiss: false,
              buttons: [
                {
                  text: translatePermissions.register_signature,
                  handler: () => {
                    this.navCtrl.setPages([{ page: HomePage }, { page: ProfilePage }])
                    return;
                  }
                }
              ]
            });
            loading.dismiss()
            alert.present();

            return;
          } else {
            await loading.dismiss()
          }
        } else {
          await loading.dismiss()
        }
      } else {
        await loading.dismiss()
      }





      let alert = this.alertCtrl.create({
        title: this.translatedContent.start_service,
        message: this.translatedContent.start_service_message,
        enableBackdropDismiss: false,
        buttons: [
          {
            text: this.translatedContent.cancel,
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: this.translatedContent.start_service,
            handler: () => {
              this.handleStart()
              return;
            }
          }
        ]
      });
      alert.present();
    }
  }

  async handleStart() {
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      content: this.translatedContent.starting_service
    });

    await loading.present();


    let serverTime: any = null;
    let resp: Geoposition = null;

    try {

      if (this.api.isConnected) {
        serverTime = await this.api.getServerTime();
      } else {
        serverTime = null;
      }
      resp = await this.geolocation.getCurrentPosition({ timeout: 8000, maximumAge: 60000 });
    } catch (err) {
      console.log('DEU ERRO PRA PEGAR O LOCATION', err);
    }


    let perimeterChecked = false;
    let currentDistance = null;
    if (this.scheduling.contract.client.perimeter) {
      if (resp && resp.coords) {
        currentDistance = this.getDistance(
          {
            lat: resp.coords.latitude,
            lng: resp.coords.longitude
          },
          { lat: parseFloat(this.scheduling.contract.client.latitude), lng: parseFloat(this.scheduling.contract.client.longitude) }
        );

        //console.log(resp, currentDistance);


        if (currentDistance > this.scheduling.contract.client.perimeter) {
          //alert

          perimeterChecked = true;

          let alert = this.alertCtrl.create({
            title: "Atenção",
            message: `Você está iniciando esta ordem de serviço fora do perímetro de ${this.scheduling.contract.client.perimeter}mt deste cliente.`,
            enableBackdropDismiss: false,
            buttons: ['OK']
          });
          await alert.present();
        }

      }
    }





    let serviceOrder = {
      perimeter_checkin: perimeterChecked ? currentDistance <= this.scheduling.contract.client.perimeter ? true : false : null,
      location: resp ? [resp.coords.latitude, resp.coords.longitude] : [0, 0],
      data: this.scheduling,
      datetimeScheduling: this.scheduling.start_time,
      dateTimeStart: new Date(),
      servertimeStart: serverTime ? new Date(serverTime.server_time) : null,
      gpstimeStart: resp && resp.timestamp ? new Date(resp.timestamp) : null,
      synced: false,
      scheduling_id: this.scheduling.id,
      id: this.scheduling.contract.branch.os_number + 1,
      is_audit: !!(this.scheduling && this.scheduling.schedule_contract && this.scheduling.schedule_contract.client && this.scheduling.schedule_contract.client.chain_id )
    }
    let saveToStorage = await this.storage.set('service_order', serviceOrder)

    if (!saveToStorage) {

      let alert = this.alertCtrl.create({
        title: this.translatedContent.start_error_title,
        message: this.translatedContent.start_error_message,
        enableBackdropDismiss: false,
        buttons: ['OK']
      });
      await loading.dismiss();
      await alert.present();
    } else {
      //this.navCtrl.push(ServiceOrderPage);
      this.navCtrl.push(ServiceOrderPage, { os: serviceOrder });
    }


    /*} else {
      console.log('Error getting location', 'ERROR GETTING GEOLOCATION');
      await loading.dismiss();
      this.retryAlert()
    }*/
  }

  rad(x) {
    return (x * Math.PI) / 180;
  }

  getDistance(p1, p2) {
    //console.log(p1, p2);


    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2.lat - p1.lat);
    var dLong = this.rad(p2.lng - p1.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) *
      Math.cos(this.rad(p2.lat)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
  }

  async retryAlert() {

    let serverTime = await this.api.getServerTime();

    let alert = this.alertCtrl.create({
      title: this.translatedContent.location_error_title,
      message: this.translatedContent.location_error_message,
      enableBackdropDismiss: false,
      buttons: [
        {
          text: this.translatedContent.start_without_location,
          role: 'cancel',
          handler: () => {
            let serviceOrder = {
              location: [0, 0],
              data: this.scheduling,
              datetimeScheduling: this.scheduling.start_time,
              dateTimeStart: new Date(),
              servertimeStart: serverTime ? serverTime.server_time : null,
              gpstimeStart: null,
              synced: false,
              scheduling_id: this.scheduling.id,
              id: this.scheduling.contract.branch.os_number + 1
            }
            this.storage.set('service_order', serviceOrder).then(data => {
              this.navCtrl.push(ServiceOrderPage);
            });
          }
        },
        {
          text: this.translatedContent.try_again,
          handler: () => {
            this.startService();
          }
        }]
    });
    alert.present();
  }

  async delete() {

    let alert = this.alertCtrl.create({
      title: 'Atenção',
      message: 'Tem certeza que deseja deletar este agendamento?',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: this.translatedContent.cancel,
          role: 'cancel',
          handler: () => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Excluir Agendamento',
          handler: () => {
            let idsToExclude = [this.scheduling.id];

            let loading = this.loadingCtrl.create({
              dismissOnPageChange: false,
              content: 'Atualizando agenda...'
            });

            loading.present().then(() => {
              this.api.deleteScheduling(idsToExclude).subscribe(res => {
                loading.dismiss();
                this.navCtrl.pop();

              });
            });
          }
        }
      ]
    });
    alert.present();



  }

  changeService(contract) {
    this.navCtrl.push(ScheduleUpdatePage, { schedule: this.scheduling, client: contract });
  }

  editMirror(contract) {
    this.navCtrl.push(ClientDetailsPage, { client: contract })
  }

}
