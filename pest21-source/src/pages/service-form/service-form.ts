import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import moment from 'moment';
import { PestModalSelectorComponent } from '../../components/pest-modal-selector/pest-modal-selector';
import { DateTimeHelperProvider } from '../../providers/date-time-helper/date-time-helper';
import { DeviceCheckerComponent } from './../../components/device-checker/device-checker';
import { DatePipe } from '@angular/common';
/**
 * Generated class for the ServiceFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

class Sector {
  public id: number;
  public name: string;
  public sector: string;
  public local: string;
}

@Component({
  selector: 'page-service-form',
  templateUrl: 'service-form.html',
})
export class ServiceFormPage {
  plague_groups: Sector[];
  plagues: any[];
  traces: any[];
  products: any[];
  devices: any[];
  deviceStates: any = [];
  port: Sector;
  sectors: any[];

  specific: any = {};
  praga: any = {};
  placesFound: any[] = [0];


  target: any;
  activity: any;
  sector: any;
  hasPlagues: any;
  hasTraces: any;
  hasProducts: any;
  hasDevices: any;



  tracesArray: any = [];
  productsArray: any = [];
  devicesArray: any = [];
  demoPests: any = [];
  equipments: any = [];
  sectorForm: FormGroup;
  sectorNameControl: FormControl;
  localNameControl: FormControl;
  currentDate: any;
  maxyear: any;

  @ViewChild('sectorComponent') sectorComponent: IonicSelectableComponent;


  constructor(
    public loading: LoadingController,
    private formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public translate: TranslateService,
    public dateTimeHelper: DateTimeHelperProvider,
    public storage: Storage,
    public datePipe: DatePipe,) {
      
    let date = new Date();
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.maxyear = (new Date().getFullYear()+5).toString();

    this.storage.get('pest_groups').then(groups => {
      this.plague_groups = groups.sort((a, b) => {
        console.log(a, b);
        return a.name.localeCompare(b.name);
      });
    });

    this.storage.get('service_order').then(os => {
      this.sectors = os.data.contract.client.sectors;
      console.log('SECTORS', this.sectors);


      this.sectorNameControl = this.formBuilder.control(null, Validators.required);
      this.localNameControl = this.formBuilder.control(null, Validators.required);
      this.sectorForm = this.formBuilder.group({
        sectorName: this.sectorNameControl,
        sectorLocal: this.localNameControl
      });


    });

    this.plagues = [];
    this.traces = [];
    this.products = [];

    this.storage.get('devices').then(devices => {
      this.devices = devices.sort((a, b) => {
        console.log(a, b);
        return a.name.localeCompare(b.name);
      });
    });

    this.storage.get('equipments').then(equipments => {
      this.equipments = equipments
    });
    this.deviceStates = [];
  };

  sector_plagues: any = [];



  /* SECTOR ADD TEST*/

  toggleItems() {
    this.sectorComponent.toggleItems(this.sectorComponent.itemsToConfirm.length ? false : true);

    // Confirm items and close Select page
    // without having the user to click Confirm button.
    // this.confirm();
  }

  confirm() {
    //alert('teste');
    this.sectorComponent.confirm();
    this.sectorComponent.close();
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

  onAddPort(event: {
    component: IonicSelectableComponent
  }) {
    // Clean form.
    this.sectorNameControl.reset();
    this.localNameControl.reset();


    // Copy search text to port name field, so
    // user doesn't have to type again.
    this.sectorNameControl.setValue(this.sectorComponent.searchText);

    // Show form.
    this.sectorComponent.showAddItemTemplate();
    // event.component.showAddItemTemplate();
  }

  onSavePort(event: {
    component: IonicSelectableComponent,
    item: Sector
  }) {
    // Fill form.
    this.sectorNameControl.setValue(event.item.sector);
    this.localNameControl.setValue(event.item.local);

    // Show form.
    event.component.showAddItemTemplate();
  }

  onDeletePort(event: {
    component: IonicSelectableComponent,
    item: Sector
  }) {
    // Delete port from storage.
    //this.portService.deletePort(event.item);

    // Delete port from list.
    //event.component.deleteItem(event.item);
  }

  addSector() {
    // Create port.
    let sector = new Sector();


    sector.id = Math.floor(Math.random() * 1000000000);
    sector.name = this.sectorNameControl.value + " / " + this.localNameControl.value;
    sector.sector = this.sectorNameControl.value;
    sector.local = this.localNameControl.value;


    // Add port to storage.
    //this.portService.addPort(port);

    this.storage.get('service_order').then(os => {
      os.data.contract.client.sectors.push(sector);
      this.storage.set('service_order', os);
    });

    // Add port to the top of list.
    this.sectorComponent.addItem(sector).then(() => {
      //this.sectorComponent.search(sector.name);
    });


    // Clean form.
    this.sectorNameControl.reset();
    this.localNameControl.reset();

    // Show list.
    this.sectorComponent.hideAddItemTemplate();
  }

  savePort(sector: Sector) {
    // Change port.
    sector.name = this.sectorNameControl + " / " + this.localNameControl.value;
    sector.sector = this.sectorNameControl.value;
    sector.local = this.localNameControl.value;

    // Show list.
    this.sectorComponent.hideAddItemTemplate();
  }

  /* END SECTOR ADD TEST */


  getSectorsWithoutPlages(sectors) {
    console.log(sectors);
    return sectors.filter(sector => {
      return !sector.plagues || !sector.plagues.length;
    });

  }

  resetForm(form: NgForm) {
    if (form) {
      form.reset();
    }
  }
  addPlace() {
    this.placesFound.push(this.placesFound[this.placesFound.length - 1] + 1);
  }

  addVestigio(evidences: any, places: any) {
    console.log(evidences, places);
    let evd = {
      evidences,
      places
    }
    this.tracesArray.push(evd);

  }

  portChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('port:', event.value);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceFormPage');
  }

  onSearchFail(event) {
    console.log(event);
  }


  getOrdenedProducts(products) {
    if (products) {
      return products.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }
  openPestSelector(index, plagues, place, target = null) {
    let data = JSON.parse(JSON.stringify(plagues));;
    let modal = this.modalCtrl.create(PestModalSelectorComponent, { plagues: data });
    modal.present().then(data => {
      console.log('PRESENT', data);
    });

    modal.onDidDismiss(data => {
      console.log('DISMISS', data);
      if (data) {
        //this.demoPests[index] = data;
        this.sector_plagues[index]['plagues'] = data;

      }
    })
  }


  validDate: any;

  setValidDate() {

    this.dateTimeHelper.getOldDate("date", new Date(), new Date().getTime()).then((date: Date) => {
      this.validDate = moment(date).format();
    }).catch(err => {
      console.log(err);
    });
  }


  getDevicesUnconfirmed(devices) {
    let filtered;

    if (devices) {
      filtered = devices.filter(device => {
        return device['confirmed'] != true;
      });
      return filtered.length;
    } else {
      return 0;
    }
  }

  deviceMaker: any = [];

  allPlacesHasPlagues(): Boolean {
    let has = true;

    if (!this.sector_plagues.length) {
      return false
    } else {
      this.sector_plagues.forEach(sector => {
        if (!sector.plagues || !sector.plagues.length) {
          has = false;
        }
      });
    }


    return has;
  }

  openDeviceChecker(devices: number, form, device, state) {

    console.log(device);


    if (!this.deviceMaker || this.deviceMaker.length == 0) {
      this.deviceMaker = [];
      for (let i = 0; i < devices; i++) {
        this.deviceMaker.push({
          name: i + 1,
          id: i + 1,
          checked: false,
          state: state.id
        });
      }
    } else {
      this.deviceMaker.forEach(dd => {
        if (!dd.confirmed) {
          dd.state = state.id;
        }
      });
    }


    let modal = this.modalCtrl.create(DeviceCheckerComponent, { devices: this.deviceMaker });
    modal.present().then(data => {
      console.log('PRESENT', data);
    });

    modal.onDidDismiss(data => {
      console.log('DISMISS CHECKER', data);
      if (data) {
        console.log(data);
        this.deviceMaker = data;
      }
    })
  }

  addProduct(form: NgForm) {
    console.log(form);
    this.productsArray.push(form.control.getRawValue());
    form.resetForm();
    form.controls.validDate.setValue("");

  }

  addDevices(form: NgForm, device, state) {


    this.deviceMaker.forEach(checkedDevice => {
      device.statuses.forEach(status => {
        if (checkedDevice.state && checkedDevice.state == status.id) {
          console.log(checkedDevice.state.id, status.id);
          status.installed = status.installed || [];
          status.installed.push(checkedDevice);
        }
      });
    });

    device.statuses = device.statuses.filter(status => {
      return status.installed && status.installed.length;
    });
    this.devicesArray.push(device);
    form.reset();

    this.storage.get('devices').then(devices => {
      this.deviceMaker = [];
      this.devices = devices
    });

  }

  getDispositives(ammount): any[] {

    let dispositives = [];

    for (let i = 0; i < ammount; i++) {

      let dispositive = {
        id: i,
        name: i + 1
      }

      dispositives.push(dispositive);

    }

    return dispositives;

  }

  changeProductQty(product, unity, amount: any) {
    if (product) {
      let concentration = product.concentration || 0;
      amount.value = (concentration * unity).toFixed(2);
      unity = parseFloat(unity).toFixed(2);
    }
  }

  save() {
    this.translate.get('os_form').subscribe(trans => {
      let loading = this.loading.create({
        dismissOnPageChange: true,
        content: trans.saving_service
      });
      loading.present().then(() => {
        let target: any = this.target;
        let activity: any = this.activity;
        let sector: any = this.sector;
        let hasPlagues: any = this.hasPlagues;
        let hasTraces: any = this.hasTraces;
        let hasProducts: any = this.hasProducts;
        let hasDevices: any = this.hasDevices;

        let sectorPlagues: any = this.sector_plagues;

        let tracesArray: any = this.tracesArray;
        let productsArray: any = this.productsArray;
        let devicesArray: any = this.devicesArray;
        //let plaguesArray: any = this.demoPests;


        let service = {
          target,
          activity,
          sector,
          hasPlagues,
          hasTraces,
          hasProducts,
          hasDevices,
          tracesArray,
          productsArray,
          devicesArray,
          sectorPlagues
        };



        this.storage.get('service_order').then((os: any) => {
          if (!os.services) {
            os.services = [];
          }

          os.services.push(service);


          devicesArray.forEach(device => {

            console.log('SAVING', device);
            if (device.insect_count) {
              if (!os.counting_devices) {
                os.counting_devices = [];
              }
              os.counting_devices.push(device);
            }
          });


          delete target.plague_species;
          delete target.products;
          delete target.traces;



          this.storage.set('service_order', os).then(data => {




            loading.dismiss();
            let alert = this.alertCtrl.create({
              title: trans.saved_service,
              message: trans.saved_service_success,
              enableBackdropDismiss: false,
              buttons: [{
                text: 'OK',
                handler: () => {
                  this.navCtrl.pop();
                }
              },]
            });
            alert.present();
          });

        });






      });

    });

  }

}
