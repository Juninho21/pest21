import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { PestModalSelectorComponent } from '../../components/pest-modal-selector/pest-modal-selector';
import { Storage } from '@ionic/storage';
import { DatePicker } from '@ionic-native/date-picker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeHelperProvider } from '../../providers/date-time-helper/date-time-helper';
import moment from 'moment';

/**
 * Generated class for the MipPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-mip',
  templateUrl: 'service-order-mip.html',
})
export class ServiceOrderMipPage {

  sectors: any = [];
  pests: any = {};
  currentDate: any;
  maxyear: any;
  plagues: any = [];
  constructor(
    public storage: Storage,
    private datePicker: DatePicker,
    public datePipe: DatePipe,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public dateTimeHelper: DateTimeHelperProvider,
    public modalCtrl: ModalController) {
    let date = new Date();
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.maxyear = (new Date().getFullYear()+5).toString();

    this.storage.get('service_order').then(os => {
      if (os.services) {
        os.services.forEach(service => {
          service.sector.forEach(sector => {
            if (this.sectors.indexOf(sector) == -1) {
              this.sectors.push(sector);
            }
          });
        });
      } else {
        this.navCtrl.pop().then(data => {
          this.translate.get(['os_noncompliance.warning', 'attention']).subscribe(res => {
            console.log(res);
            let alert = this.alertCtrl.create({
              title: res.attention,
              message: res['os_noncompliance.warning'],
              enableBackdropDismiss: false
            });

            alert.addButton({
              text: 'OK',
              handler: data => {

              }
            });
            alert.present();
          });
        });
      }
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad MipPage');


    this.storage.get('pest_groups').then(pest_groups => {
      pest_groups.forEach(group => {
        if (group.mip_count === true) {
          delete group.plague_species;
          this.plagues.push(group);
        }
      });
    });
  }

  startDate: any;
  endDate: any;
  setMipDate(field) {

    if (field == 'startDate') {
      this.dateTimeHelper.getMipDate("date", new Date(), "").then((date: Date) => {
        this.startDate = moment(date).format();
      }).catch(err => {
        console.log(err);
      });
    } else if (field == 'endDate') {
      this.dateTimeHelper.getMipDate("date", new Date(), new Date(this.startDate).getTime()).then((date: Date) => {
        this.endDate = moment(date).format();
      }).catch(err => {
        console.log(err);
      });
    }
  }

  openDatePicker(min, max, field) {
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      minDate: min,
      maxDate: max,
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => {
        field = date;
      },
      err => console.log('Error occurred while getting date: ', err)
    );
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

  save(form: NgForm) {
    let formData = form.control.getRawValue();
    formData.plagues = this.pests;
    console.log(formData);

    this.storage.get('service_order').then(os => {
      if (!os.mips) {
        os.mips = [];
      }

      os.mips.push(formData);


      this.storage.set('service_order', os).then(data => {

        this.translate.get(['os_mip.success', 'attention']).subscribe(res => {
          let alert = this.alertCtrl.create({
            title: res.attention,
            message: res['os_mip.success'],
            enableBackdropDismiss: false
          });

          alert.addButton({
            text: 'OK',
            handler: data => {

              let startDate = form.controls.startDate.value;
              let endDate = form.controls.endDate.value;
              form.reset();

              form.controls.startDate.setValue(startDate);
              form.controls.endDate.setValue(endDate)
              this.pests = [];
            }
          });
          alert.present();
        });
      });
    });




  }

}
