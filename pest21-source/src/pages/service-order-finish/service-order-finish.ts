import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { ServiceOrderEvaluationPage } from '../service-order-evaluation/service-order-evaluation';
import { ApiProvider } from './../../providers/api/api';
import { HomePage } from './../home/home';

/**
 * Generated class for the ServiceOrderFinishPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var SignaturePad;

@Component({
  selector: 'page-service-order-finish',
  templateUrl: 'service-order-finish.html',
})
export class ServiceOrderFinishPage {

  @ViewChild('canvas') canvas: ElementRef;

  signaturePad: any;
  signature: string = null;
  emails: any = [{ email: '' }];
  showCanvas: boolean = false;
  client: any = {};
  name: string = "";
  phone: string = "";
  validateAudit: boolean = true;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    private geolocation: Geolocation,
    private openNativeSettings: OpenNativeSettings,
    private diagnostic: Diagnostic,
    public api: ApiProvider) {

    this.storage.get('service_order').then(os => {
      this.client = os.data.contract.client;

      if (this.client.contacts && this.client.contacts.length) {
        console.log('FOI', this.client.contacts);
        this.name = this.client.contacts[0].name;
        this.phone = this.client.contacts[0].telephone;
        this.emails[0].email = this.client.contacts[0].email;
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderFinishPage');

    this.signaturePad = new SignaturePad(this.canvas.nativeElement, {
      onEnd: () => {
        this.signature = this.signaturePad.toDataURL();
      }
    });

    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth * ratio;
    this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight * ratio;
    this.canvas.nativeElement.getContext("2d").scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
    this.signaturePad.on(data => {
      console.log('TESTE', data);
    });

    this.storage.get('service_order').then(os => {
     
      console.log(os);
      let mainAudit = !!(os.data && os.data.schedule_contract && os.data.schedule_contract.client && os.data.schedule_contract.client.chain && os.data.schedule_contract.client.chain.audit_id);
      if(mainAudit) {
        if (os.audits === null || typeof os.audits === 'undefined' || os.audits.length === 0) {
          console.log("Não existe auditoria, não pode continuar");
        } else {
          this.validateAudit = false;
        }
      } else {
        this.validateAudit = false;
      }
      

    }).catch(err => {
      console.log(err);
    })

  }

  toSignature() {
    console.log('END', this.signaturePad);
  }

  clearSignature() {

    this.signaturePad.clear();
    this.signature = null;
  }

  async save(form: NgForm) {

    let trans = await this.translate.get('os_finish.saving_os').toPromise();


    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      enableBackdropDismiss: false,

      content: trans
    });
    let subscription;

    loading.willEnter.subscribe(() => {
      subscription = this.platform.registerBackButtonAction(() => {
        console.log('back button pressed');
      }, 10);
    });

    loading.onDidDismiss(() => {
      subscription();
    });

    await loading.present();


    let isLocationEnabled = await this.diagnostic.isLocationEnabled().catch(err => console.log(err));
    let isWifiEnabled: boolean = await this.diagnostic.isWifiAvailable().catch(err => console.log(err));
    let isMobileDataEnabled, isAutomaticTimeEnabled;

    if (window['CheckMobileDataEnabled']) {
      isMobileDataEnabled = await window['CheckMobileDataEnabled']['isMobileDataEnabled']();
      isAutomaticTimeEnabled = await window['CheckMobileDataEnabled']['isAutomaticTimeChecked']();
    }

    console.log(isLocationEnabled, isWifiEnabled, isMobileDataEnabled, isAutomaticTimeEnabled);

    let errorMessage = "";

    let translatePermissions = await this.translate.get('permissions').toPromise();
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
          await loading.dismiss()
          await alert.present();

          return;

        } else {

        }
      } else {

      }
    } else {

    }



    let data = form.control.getRawValue();
    data.signature = this.signaturePad.toDataURL();
    data.email = this.emails[0].email;



    if (!/^[A-Za-z\s.\(\)0-9]{3,}$/i.test(data.name)) {

      let alert = this.alertCtrl.create({
        title: "Atenção",
        message: 'Preencha um nome de contato válido com nome e sobrenome',
        enableBackdropDismiss: false,
        buttons: ['OK']
      });

      await alert.present();
      await loading.dismiss();
      return;
    }
    let filter = {
      name: data.name,
      signature: data.signature,
      phone: data.phone,
      emails: []
    }

    this.emails.forEach(email_field => {
      filter.emails.push(email_field.email);
    });

    let serverTime: any = null;
    let geoResponse: Geoposition = null;

    try {
      if (this.api.isConnected) {
        serverTime = await this.api.getServerTime();
      } else {
        serverTime = null;
      }
      geoResponse = await this.geolocation.getCurrentPosition({ timeout: 8000, maximumAge: 60000 });
    } catch (err) {
      console.log(err);
    }



    let perimeterChecked = false;
    let currentDistance = null;

    if (this.client.perimeter) {
      if (geoResponse && geoResponse.coords) {
        currentDistance = this.getDistance(
          {
            lat: geoResponse.coords.latitude,
            lng: geoResponse.coords.longitude
          },
          { lat: parseFloat(this.client.latitude), lng: parseFloat(this.client.longitude) }
        );

        console.log(geoResponse, currentDistance);


        if (currentDistance > this.client.perimeter) {
          //alert

          perimeterChecked = true;

          let alert = this.alertCtrl.create({
            title: "Atenção",
            message: `Você está finalizando esta ordem de serviço fora do perímetro de ${this.client.perimeter}mt deste cliente.`,
            enableBackdropDismiss: false,
            buttons: ['OK']
          });
          await alert.present();
        }
      }

    }




    let os = await this.storage.get('service_order');

    os.approval = filter;
    os.perimeter_checkout = perimeterChecked ? currentDistance <= this.client.perimeter ? true : false : null;
    os.datetimeEnd = new Date();
    os.servertimeEnd = serverTime ? new Date(serverTime.server_time) : null;
    os.gpstimeEnd = geoResponse && geoResponse.timestamp ? new Date(geoResponse.timestamp) : null;
    os.locationEnd = geoResponse ? [geoResponse.coords.latitude, geoResponse.coords.longitude] : [0, 0];
    os.client_id = os.data.contract.client.id
    os.contract_id = os.data.contract.id;
    os.schedule = {
      schedule_service: os.data.schedule_service,
      schedule_type: os.data.schedule_type,
      start_time: os.data.start_time,
      end_time: os.data.end_time,
      contract_id: os.contract_id,
      id: null
    }

    if (os.scheduling_id) {
      os.schedule.id = os.scheduling_id;
    }

    await this.storage.set('service_order', os);
    await loading.dismiss();
    //this.laterSave(os);

    this.navCtrl.setRoot(ServiceOrderEvaluationPage, { animate: true, direction: 'back' });

  }

  successSave(os) {

    this.translate.get(['attention', 'os_finish.saved_os']).subscribe(trans => {


      let alert = this.alertCtrl.create({
        enableBackdropDismiss: false,
      });
      alert.setTitle(trans['attention']);
      alert.setMessage(trans['os_finish.saved_os'])
      alert.addButton({
        text: 'OK',
        handler: data => {
          this.storage.get('os_pool_' + this.api.currentUser.id).then(pool => {
            let cPool
            if (!pool) {
              cPool = [];
            } else {
              cPool = pool;
            }

            os.saved = true;
            cPool.push(os);

            this.storage.set('os_pool_' + this.api.currentUser.id, cPool).then(() => {
              this.navCtrl.setRoot(HomePage, { animate: true, direction: 'back' });
            });
          });
        }
      });
      alert.present();
    });
  }

  rad(x) {
    return (x * Math.PI) / 180;
  }

  getDistance(p1, p2) {
    console.log(p1, p2);


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

  laterSave(os) {

    this.translate.get(['attention', 'os_finish.saved_os_offline']).subscribe(trans => {
      let alert = this.alertCtrl.create({
        enableBackdropDismiss: false,

      });

      alert.setTitle(trans['attention']);
      alert.setMessage(trans['os_finish.saved_os_offline']);
      alert.addButton({
        text: 'OK',
        handler: data => {
          this.storage.get('os_pool_' + this.api.currentUser.id).then(pool => {
            let cPool
            if (!pool) {
              cPool = [];
            } else {
              cPool = pool;
            }

            os.saved = false;
            cPool.push(os);

            this.storage.set('os_pool_' + this.api.currentUser.id, cPool).then(() => {
              this.navCtrl.setRoot(HomePage, { animate: true, direction: 'back' });
            });
          });
        }
      });
      alert.present();
    });

  }


}
