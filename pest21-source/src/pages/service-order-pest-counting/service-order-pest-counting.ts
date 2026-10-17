import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController, NavController, NavParams } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { PestModalSelectorComponent } from '../../components/pest-modal-selector/pest-modal-selector';

/**
 * Generated class for the PestCountingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-pest-counting',
  templateUrl: 'service-order-pest-counting.html',
})
export class ServiceOrderPestCountingPage {
  devices: any = [];
  deviceNumbers: any = [];
  plagues: any = [];
  pests: any = [];
  noPestFound: boolean = false;
  device: any = null;
  deviceNumber: any = null;
  deviceNumberMultiple: any = [];
  count_type: any = null;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public storage: Storage) {

  }

  getFormData(device = null) {
    this.devices = [];
    this.deviceNumbers = [];
    this.deviceNumberMultiple = [];
    this.pests = [];
    this.count_type = null;
    this.plagues = [];


    this.storage.get('service_order').then(os => {
      if (os.counting_devices) {
        this.devices = os.counting_devices;
      }

    });

    this.storage.get('pest_groups').then(pest_groups => {
      pest_groups.forEach(group => {
        if (group.insect_count) {
          delete group.plague_species;
          this.plagues.push(group);
        }
      });


      if (device) {
        this.devices.forEach(dev => {
          if (device.id == dev.id) {
            this.device = dev;
            this.deviceNumber = null;
            this.setDeviceNumbers(this.device.statuses);
          }
        });


      }
    });
  }

  ionViewDidLoad() {
    this.getFormData()
  }

  openPestSelector() {
    let modal = this.modalCtrl.create(PestModalSelectorComponent, { type: 'amount', plagues: this.plagues });
    modal.present().then(data => {
      console.log('PRESENT', data);
    });

    modal.onDidDismiss(data => {
      console.log('DISMISS', data);
      if (data) {
        this.pests = data;
      }
    })
  }


  setDeviceNumbers(devices) {
    console.log('CHANGED', devices);
    if (devices) {
      this.deviceNumbers = [];
      devices.forEach(device => {
        let filter = device.installed.filter(device => {
          return device['counted'] != true;
        });

        this.deviceNumbers = this.deviceNumbers.concat(filter);
        this.deviceNumbers = this.deviceNumbers.sort((a, b) => a.id - b.id);
      });

    }

    return [];
  }

  async save(form: NgForm) {

    let formData = form.control.getRawValue();
    if (formData.count_type == 'with_plagues') {

      formData.device_id = formData.device.id;
      formData.device_number = {
        id: formData.deviceNumber.id,
        name: formData.deviceNumber.name,
      };


      formData.plagues = this.pests;
      formData.noPestFound = false;
      console.log(formData);

      let os = await this.storage.get('service_order');
      if (!os.insect_counting) {
        os.insect_counting = [];
      }

      os.insect_counting.push(formData);


      os.counting_devices.forEach(deviceInfo => {
        if (deviceInfo.id == formData.device_id) {
          deviceInfo.statuses.forEach(status => {
            status.installed.forEach(device => {
              if (device.id == formData.device_number.id) {
                device.counted = true;
              }
            });

          });
        }
      });

      console.log(os);

      let data = await this.storage.set('service_order', os);




    } else if (formData.count_type == 'without_plagues') {
      let concatData: any = [];


      formData.deviceNumberMultiple.forEach((deviceNumber, index) => {
        concatData[index] = {
          device_id: formData.device.id,
          device: formData.device,
          device_number: {
            id: deviceNumber.id,
            name: deviceNumber.name,
          },
          noPestFound: true,
          deviceNumber,
          plages: []
        };
        concatData.plagues = [];
        console.log(concatData);

      });

      let os = await this.storage.get('service_order');
      if (!os.insect_counting) {
        os.insect_counting = [];
      }

      os.insect_counting = [...os.insect_counting, ...concatData];


      os.counting_devices.forEach(deviceInfo => {
        concatData.forEach(formData => {
          if (deviceInfo.id == formData.device_id) {
            deviceInfo.statuses.forEach(status => {
              status.installed.forEach(device => {
                if (device.id == formData.device_number.id) {
                  device.counted = true;
                }
              });

            });
          }

        });
      });

      let data = await this.storage.set('service_order', os);
    }

    this.deviceNumbers = [];


    this.translate.get(['attention', 'os_count.success']).subscribe(res => {


      let alert = this.alertCtrl.create({
        title: res.attention,
        message: res['os_count.success'],
        enableBackdropDismiss: false
      });

      alert.addButton({
        text: 'OK',
        handler: data => {

          form.reset();
          this.device = null;
          this.getFormData(formData.device);

          //form.reset();
        }
      });
      alert.present();
    });


  }

  toggleCustomItems(component: IonicSelectableComponent) {
    component.toggleItems(component.itemsToConfirm.length ? false : true);

    // Confirm items and close Select page
    // without having the user to click Confirm button.
    // this.confirm();
  }

  confirmCustom(component: IonicSelectableComponent) {
    //alert('teste');
    component.confirm();
    component.close();
  }



}
