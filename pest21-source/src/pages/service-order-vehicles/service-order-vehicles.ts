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
  selector: 'page-service-order-vehicles',
  templateUrl: 'service-order-vehicles.html',
})
export class ServiceOrderVehiclesPage {

  user: any = {};
  plague_groups: Sector[];
  plagues: any[];
  products: any[];
  plate: string;
  plates: string[];
  note: string;

  target: any;
  activity: any;
  hasProducts: any;

  productsArray: any = [];
  equipments: any = [];
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


    this.storage.get('user').then(user => {
      if(user){
        this.user = user;
        console.log(this.user );
      }
    });

    this.storage.get('pest_groups').then(groups => {

      this.plague_groups = groups.sort((a, b) => {

        console.log(a, b);
        return a.name.localeCompare(b.name);
      });
    });

    this.plagues = [];
    this.products = [];
    this.plates = [];

    this.storage.get('equipments').then(equipments => {
      this.equipments = equipments
    });

  };

  toggleItems() {
    this.sectorComponent.toggleItems(this.sectorComponent.itemsToConfirm.length ? false : true);
  }

  confirm() {
    this.sectorComponent.confirm();
    this.sectorComponent.close();
  }

  toggleCustomItems(component: IonicSelectableComponent) {
    component.toggleItems(component.itemsToConfirm.length ? false : true);
  }

  confirmCustom(component: IonicSelectableComponent) {
    component.confirm();
    component.close();
  }


  resetForm(form: NgForm) {
    if (form) {
      form.reset();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderVehiclesPage');
  }

  onSearchFail(event) {
    console.log(event);
  }

  formatPlate(event: any) {
    // Obter o valor e remover caracteres não alfanuméricos
    let plate = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
    // Aplicar formatação com base no comprimento da placa
    if (plate.length > 7) {
      // Formato para placas Mercosul com 8 caracteres
      plate = plate.slice(0, 3) + '-' + plate.slice(3, 7);
    } else if (plate.length > 5) {
      // Formato para placas antigas brasileiras, ex: ABC-1234
      plate = plate.slice(0, 3) + '-' + plate.slice(3, 7);
    } else if (plate.length > 3) {
      // Formato para placas argentinas antigas, ex: AB 123 CD
      plate = plate.slice(0, 2) + ' ' + plate.slice(2, 5) + (plate.length > 5 ? ' ' + plate.slice(5) : '');
    } else {
      // Formato padrão para placas curtas
      plate = plate.slice(0, 3) + (plate.length > 3 ? '-' + plate.slice(3) : '');
    }
  
    // Atualizar o valor do campo no DOM
    event.target.value = plate;
  
    // Atualizar o valor no ngModel
    this.plate = plate;
  }
  

  isPlateValid(): boolean {
    return this.plate != null && this.plate.length >= 6;
  }

  showAddPlate(): boolean {
    return !(this.plate != null && this.isPlateValid());
  }

  showItemGroupProducts(): boolean {
    return this.target && this.activity && this.plates.length > 0 && this.activity !== 'inspection';
  }

  showItemGroupNote(): boolean {
    return this.target && this.activity && this.plates.length > 0;
  }

  showButtonSave(): boolean {
    return this.target && this.activity && this.plates.length > 0;
  }

  getOrdenedProducts(products) {
    if (products) {
      return products.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return [];
    }
  }

  addPlate(plate: string) {
    console.log(plate);
    this.plates.push(plate);
    this.plate = null;
    console.log("Placa adicionada");
  }

  validDate: any;

  setValidDate() {

    this.dateTimeHelper.getOldDate("date", new Date(), new Date().getTime()).then((date: Date) => {
      this.validDate = moment(date).format();
    }).catch(err => {
      console.log(err);
    });
  }

  addProduct(form: NgForm) {
    console.log(form);
    this.productsArray.push(form.control.getRawValue());
    form.resetForm();
    form.controls.validDate.setValue("");

  }

  changeProductQty(product, unity, amount: any) {
    if (product) {
      let concentration = product.concentration || 0;
      amount.value = (concentration * unity).toFixed(2);
      unity = parseFloat(unity).toFixed(2);
    }
  }

  save() {
    this.translate.get('os_vehicles').subscribe(trans => {
      let loading = this.loading.create({
        dismissOnPageChange: true,
        content: trans.saving_service
      });
      loading.present().then(() => {
        let target: any = this.target;
        let activity: any = this.activity;
        let plates: any = this.plates;
        let hasProducts: any = this.hasProducts;
        let productsArray: any = this.productsArray;
        let note: string = this.note;

        let vehicles = {
          target,
          activity,
          plates,
          hasProducts,
          productsArray,
          note
        };



        this.storage.get('service_order').then((os: any) => {
          if (!os.vehicles) {
            os.vehicles = [];
          }

          os.vehicles.push(vehicles);

          delete target.plague_species;
          delete target.products;
          delete target.traces;

          this.storage.set('service_order', os).then(data => {

            loading.dismiss();
            let alert = this.alertCtrl.create({
              title: trans.saved_vehicle,
              message: trans.saved_vehicle_success,
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
