import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PhotoViewer } from '@ionic-native/photo-viewer';

/**
 * Generated class for the ServiceOrderResumePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-resume',
  templateUrl: 'service-order-resume.html',
})
export class ServiceOrderResumePage {
  services: any = [];
  selector: any = 'services';

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public alertCtrl: AlertController, public photoViewer: PhotoViewer) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderResumePage');

    this.storage.get('service_order').then(os => {
      this.services = os;
      console.log(this.services);
    });
  }

  getActivityName(type) {
    if (type == 'inspection') {
      return 'Inspeção';
    } else if (type == 'treatment') {
      return 'Tratamento';
    } else if (type == 'preventive_tratment') {
      return 'Tratamento Preventivo';
    }
  }

  openPicture(url) {
    this.photoViewer.show(url, "Não Conformidade", { share: false });
  }

  deleteService(index) {
    let alert = this.alertCtrl.create({
      title: 'Deletar Serviço',
      message: "Ao remover um serviço as informações de MIP's, Contagem de Pragas e Não Conformidades serão apagadas. Tem certeza que deseja deletar este serviço?",
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'REMOVER',
          role: 'remove',
          cssClass: 'remove-color',
          handler: () => {
            this.services.services.splice(index,1);
            this.services.mips = [];
            this.services.unconformities = [];
            this.services.counting_devices = [];
            this.services.insect_counting = [];

            this.storage.set('service_order', this.services);
          }
        }
      ]
    });

    alert.present();
  }

  deleteVehicle(index) {
    let alert = this.alertCtrl.create({
      title: 'Deletar Veículo',
      message: "Tem certeza que deseja deletar este veículo?",
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'REMOVER',
          role: 'remove',
          cssClass: 'remove-color',
          handler: () => {
            this.services.vehicles.splice(index,1);
            this.storage.set('service_order', this.services);
          }
        }
      ]
    });

    alert.present();
  }

  deleteGeneral(index, key, info_device:any = null){
    let label = "";
    let label2 = "";
    if(key == 'mips'){
      label = "MIP"
      label2 = "este ";
    }else if(key == 'unconformities'){
      label = "Não Conformidade";
      label2 = "esta ";
    }else if(key == 'insect_counting'){
      label = "Contagem";
      label2 = "esta ";
    }else if(key == 'comments'){
      label = "Observação";
      label2 = "esta ";
    }

    let alert = this.alertCtrl.create({
      title: 'Remover ' + label,
      message: "Tem certeza que deseja remover "+ label2 + label +"?",
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'REMOVER',
          role: 'remove',
          cssClass: 'remove-color',
          handler: () => {
            this.services[key].splice(index,1);

            if(key == 'insect_counting'){
              this.services.counting_devices.forEach(device => {
                  device.statuses.forEach(status => {
                    status.installed.forEach(dd => {
                      if(info_device.device_number.id == dd.name ){
                        dd.counted = false;
                      }
                    });
                  });
              });
            }

            this.storage.set('service_order', this.services);
          }
        }
      ]
    });

    alert.present();
  }

}
