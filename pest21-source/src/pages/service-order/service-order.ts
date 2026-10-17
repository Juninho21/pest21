import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { ServiceOrderDetailsPage } from '../service-order-details/service-order-details';
import { ServiceOrderMipPage } from '../service-order-mip/service-order-mip';
import { ServiceOrderNonCompliancePage } from '../service-order-non-compliance/service-order-non-compliance';
import { ServiceFormPage } from './../service-form/service-form';
import { ServiceOrderFinishPage } from './../service-order-finish/service-order-finish';
import { ServiceOrderNotesPage } from './../service-order-notes/service-order-notes';
import { ServiceOrderPestCountingPage } from './../service-order-pest-counting/service-order-pest-counting';
import { ServiceOrderResumePage } from './../service-order-resume/service-order-resume';
import { ServiceOrderAuditPage } from './../service-order-audit/service-order-audit';
import { ServiceOrderVehiclesPage } from './../service-order-vehicles/service-order-vehicles';

/**
 * Generated class for the ServiceOrderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-service-order',
  templateUrl: 'service-order.html',
})
export class ServiceOrderPage {

  contracts: any = [];
  mainAudit: boolean = false;
  user_company_id: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public storage: Storage) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderPage');
  }

  ionViewDidEnter() {

    this.storage.get('user').then(user => {
      if(user){
        this.user_company_id = user.company_id;
      }
      //console.log(this.user_company_id);
    });

    let os = this.navParams.get('os') || null;
    console.log(os);
    this.mainAudit = !!(os.data && os.data.schedule_contract && os.data.schedule_contract.client && os.data.schedule_contract.client.chain && os.data.schedule_contract.client.chain.audit_id);

  }

  openPage() {
    let alert = this.alertCtrl.create({
      title: 'Página em desenvolvimento',
      message: 'Esta página ainda está em desenvolvimento.',
      enableBackdropDismiss: false,
      buttons: ['OK']
    });
    alert.present();
  }

  openOsDetails() {
    this.navCtrl.push(ServiceOrderDetailsPage, { view: true, disableEdit: true });
  }
  openServiceForm() {
    this.navCtrl.push(ServiceFormPage);
  }

  openNonCompilancePage() {
    this.navCtrl.push(ServiceOrderNonCompliancePage);
  }

  openServiceNotes() {
    this.navCtrl.push(ServiceOrderNotesPage);
  }
  openResumePage() {
    this.navCtrl.push(ServiceOrderResumePage);
  }

  openAuditPage() {
    this.navCtrl.push(ServiceOrderAuditPage);
  }

  openEvaluationPage() {
    this.storage.get('service_order').then(os => {

      if (!os.evaluation) {
        /*this.navCtrl.push(ServiceOrderEvaluationPage);
      }else {
        this.navCtrl.push(ServiceOrderFinishPage);*/
        this.navCtrl.push(ServiceOrderFinishPage);
      }
    })
  }

  openMip() {
    this.navCtrl.push(ServiceOrderMipPage);
  }

  openCounting() {
    this.navCtrl.push(ServiceOrderPestCountingPage);
  }

  openVehiclePage() {
    this.navCtrl.push(ServiceOrderVehiclesPage);
  }

}
