import { ApiProvider } from "./../../providers/api/api";
import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  AlertController,
  LoadingController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { NgForm } from "@angular/forms";
import { HomePage } from "../home/home";
import * as moment from "moment";
import "moment/locale/pt-br";
import { TranslateService } from "@ngx-translate/core";
import { DateTimeHelperProvider } from "../../providers/date-time-helper/date-time-helper";
/**
 * Generated class for the IntervalFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-interval-form",
  templateUrl: "interval-form.html"
})
export class IntervalFormPage {
  client: any = {};
  schedule_types: any = [];
  start_date: any;
  start_time: any = "12:00";
  end_time: any;
  services: any = [];
  disabled: any = [{ id: 4 }, { id: 5 }];
  interval_date: any = new Date().toISOString();
  maxDate: any = 2050;
  trans: any = {}
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public dateTimeHelper: DateTimeHelperProvider,
    public translate: TranslateService
  ) {
    this.client = this.navParams.get("client");
    moment.locale(this.translate.currentLang);

    this.translate.get('schedule_create').subscribe(res => {
      this.trans = res;
    });
  }

  getMinTime() {
    return moment(this.start_date)
      .add(1, "hour")
      .format("DD/MM/YYYY HH:mm");
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad ScheduleCreatePage");
    this.setMaxDate();

    this.start_time = moment(this.interval_date).locale(this.translate.currentLang).set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).format("HH:mm");;

  }

  async tryNewPicker(field) {

    if (field == 'interval_date') {
      this.dateTimeHelper.getDate("date", new Date(), new Date().getTime()).then((date: Date) => {
        this.interval_date = moment(date).format();
      }).catch(err => {
        console.log(err);
      });
    } else if (field == 'start_time') {
      let currentDate = new Date();
      let currentTime = this.start_time.split(":");
      currentDate.setHours(currentTime[0]);
      currentDate.setMinutes(currentTime[1]);
      this.dateTimeHelper.getDate("time", currentDate).then((date: Date) => {
        this.start_time = moment(date).format('HH:mm');
      }).catch(err => {
        console.log(err);
      });
    } else if (field == 'end_time') {
      let currentDate = new Date();
      let currentTime = this.end_time.split(":");
      currentDate.setHours(currentTime[0]);
      currentDate.setMinutes(currentTime[1]);
      this.dateTimeHelper.getDate("time", currentDate).then((date: Date) => {
        this.end_time = moment(date).format('HH:mm');
      }).catch(err => {
        console.log(err);
      });
    }


  }

  setMaxDate() {
    console.log(this.interval_date);
    this.maxDate = moment(this.interval_date).locale(this.translate.currentLang).set({ hour: 22, minute: 59, second: 0, millisecond: 0 }).format("YYYY-MM-DDTHH:mm");
    console.log(this.maxDate);
  }

  setEndTime() {

    console.log()
    this.end_time = moment(this.interval_date.split("T")[0] + " " + this.start_time)
      .add(1, "hour")
      .format("HH:mm");
  }

  save(form: NgForm) {
    console.log(form);

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: this.trans.saving_schedule
    });
    loading.present().then(() => {
      this.storage.get("user").then(user => {

        this.storage.get("schedule_types").then(schedule_types => {

          let currentScheduleType = schedule_types.filter((type) => {
            return type.is_interval == true;
          });

          console.log(schedule_types, currentScheduleType);

          let scheduling = {
            user_id: user.id,
            internal_id: new Date().getTime(),
            start_time: form.controls.interval_date.value.split("T")[0] + " " + form.controls.start_time.value,
            end_time: form.controls.interval_date.value.split("T")[0] + " " + form.controls.end_time.value,
            schedule_type: currentScheduleType[0].id,
            save_travel: false,
          };

          if (this.api.isConnected()) {
            this.api
              .saveScheduling(scheduling)
              .then(() => {
                this.storage
                  .remove("schedule_" + this.api.currentUser.id)
                  .then(() => {
                    this.api.getSchedule().then(() => {
                      loading.dismiss();
                      this.successSave();
                    });
                  });
              })
              .catch(err => {
                console.log(err);

                if (err.success == false) {
                  loading.dismiss();
                  this.errorSave(err.message || this.trans.save_error);
                } else {
                  loading.dismiss();
                  this.errorSave(err.error.message || this.trans.save_error);
                }
              });
          } else {
            this.errorSave(this.trans.internet_error)
          }
        });
      });
    });
  }

  successSave() {
    let alert = this.alertCtrl.create();
    alert.setTitle(this.trans.attention);
    alert.setMessage(this.trans.success_save);
    alert.addButton({
      text: "OK",
      role: "error",
      handler: data => {
        this.navCtrl.setRoot(HomePage, { animate: true, direction: "back" });
      }
    });
    alert.present();
  }

  laterSave() {
    let alert = this.alertCtrl.create();
    alert.setTitle(this.trans.attention);
    alert.setMessage(this.trans.save_internet_warning);
    alert.addButton({
      text: "OK",
      handler: data => {
        this.navCtrl.setRoot(HomePage, { animate: true, direction: "back" });
      }
    });
    alert.present();
  }

  errorSave(msg) {
    let alert = this.alertCtrl.create();
    alert.setTitle(this.trans.attention);
    alert.setMessage(msg);
    alert.addButton({
      text: "OK",
      handler: data => { }
    });
    alert.present();
  }
}
