import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import {
  AlertController,
  LoadingController, NavController,
  NavParams,


  Platform
} from "ionic-angular";
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import "moment/locale/pt-br";
import { DateTimeHelperProvider } from "../../providers/date-time-helper/date-time-helper";
import { HomePage } from "../home/home";
import { ApiProvider } from "./../../providers/api/api";


const newMoment = extendMoment(moment);

/**
 * Generated class for the ScheduleCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-schedule-create",
  templateUrl: "schedule-create.html"
})



export class ScheduleCreatePage {
  client: any = {};



  schedule_types: any = [];
  start_date: any;
  services: any = [];
  disabled: any = [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }];
  maxDate: any = moment.now()
  newMoment: any;
  minDate: any = moment(new Date()).format("YYYY-MM-DDTHH:mm");
  travel_time: any = "00:00";
  trans: any = {};
  workSchedule: any;

  dayNames: any = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];

  disableDebug: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public platform: Platform,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public dateTimeHelper: DateTimeHelperProvider
  ) {
    this.client = this.navParams.get("client");
    moment.locale("pt-BR");
    console.log(this.client);


    if (!this.platform.is('cordova') && this.platform.is('mobileweb')) {
      this.disableDebug = false;
    }




    this.translate.get('schedule_create').subscribe(res => {
      this.trans = res;
    });
  }

  getMinTime(start_time) {
    return moment(start_time)
      .add(1, "minute")
      .format("YYYY-MM-DDTHH:mm");
  }
  async ionViewDidLoad() {
    console.log("ionViewDidLoad ScheduleCreatePage");

    this.storage.get("services").then(services => {
      this.services = services;
    });

    this.workSchedule = await this.storage.get('work_schedule');

    this.storage.get("schedule_types").then(schedule_types => {
      this.schedule_types = schedule_types.filter(type => {
        return type.create_enabled;
      });
    });

  }

  start_time: any;
  end_time: any;

  startChange(event) {
    this.end_time = null
  }

  async tryNewPicker(field) {

    if (field == 'start_time') {
      this.dateTimeHelper.getDate("datetime", new Date(), new Date().getTime()).then((date: Date) => {
        this.start_time = moment(date).format();
      }).catch(err => {
        console.log(err);
      });
    } else if (field == 'end_time') {
      this.dateTimeHelper.getDate("datetime", new Date(), new Date(this.start_time).getTime()).then((date: Date) => {
        this.end_time = moment(date).format();
      }).catch(err => {
        console.log(err);
      });
    } else if (field == 'travel_time') {
      let currentDate = new Date();
      let currentTime = this.travel_time.split(":");
      currentDate.setHours(currentTime[0]);
      currentDate.setMinutes(currentTime[1]);
      this.dateTimeHelper.getDate("time", currentDate).then((date: Date) => {
        this.travel_time = moment(date).format('HH:mm');
      }).catch(err => {
        console.log(err);
      });
    }


  }

  getMax(time) {
    if (time) {
      let finaldate = time.substr(0, 11);
      let finaltime = time.substr(11, 7).split(":");
      let final =
        finaldate +
        " " +
        ("0" + (parseInt(finaltime[0]) + 1)).slice(-2) +
        ":" +
        finaltime[1];

      console.log(final);
      return moment(time).add(2, "hours");
    } else {
      return moment(time).add(2, "hours");
    }
  }

  async save(form: NgForm) {
    console.log(form);

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: this.trans.saving_schedule
    });
    await loading.present();
    let user = await this.storage.get("user");
    let travelTime = form.controls.travel_time.value.split(":");
    let scheduling = {
      user_id: user.id,
      contract_id: this.client.id,
      internal_id: new Date().getTime(),
      start_time: form.controls.start_time.value
        .replace("T", " ")
        .replace("Z", ""),
      end_time: form.controls.end_time.value
        .replace("T", " ")
        .replace("Z", ""),
      schedule_types: form.controls.schedule_type.value,
      schedule_type: form.controls.schedule_type.value.id,
      schedule_service: form.controls.schedule_service.value.id,
      schedule_services: form.controls.schedule_service.value,
      contract: this.client,
      save_travel:
        form.controls.travel_time.value == "00:00" ? false : true,
      travel_time_hours: travelTime[0],
      travel_time_minutes: travelTime[1],
      time_check: null,
      status: 'APPROVED'

    };
    let timeCheck = null;
    let allowedLimit = null;
    if (this.workSchedule) {


      timeCheck = await this.handleTimeCheck(scheduling);

      if (timeCheck) {
        scheduling.time_check = timeCheck;
        scheduling.status = 'PENDING';
      }


      allowedLimit = await this.handleLimitCheck(scheduling);

      if (!allowedLimit) {
        loading.dismiss();
        this.errorSave('Não é possivel criar este agendamento, pois ele excede a frequência contratada deste cliente para o mês selecionado.')
        return;
      }

    }

    if (this.api.isConnected()) {
      this.api
        .saveScheduling(scheduling)
        .then(() => {
          this.storage
            .remove("schedule_" + this.api.currentUser.id)
            .then(() => {
              this.api.getSchedule().then(() => {
                loading.dismiss();
                if (timeCheck) {
                  this.timeCheckAlert(timeCheck, 'successSave');
                } else {
                  this.successSave();
                }
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
            this.errorSave(
              err.error.message || this.trans.save_error
            );
          }
        });
    } else {

      this.storage
        .get("schedule_" + this.api.currentUser.id)
        .then(schedule => {

          if (!schedule) {
            schedule = [];
          }

          let canAdd = {
            valid: true,
            error: null
          };
          schedule.forEach(point => {
            let aStart = new Date(scheduling.start_time);
            let aEnd = new Date(scheduling.end_time);
            let bStart = new Date(point.start_time);
            let bEnd = new Date(point.end_time);

            let range = newMoment().range(bStart, bEnd);



            if (
              range.contains(aStart) || range.contains(aEnd)
            ) {
              console.log(aStart, aEnd, range);
              canAdd.valid = false;
              canAdd.error = `${this.trans.save_conflict_one}`;

            }

            if (scheduling.save_travel) {
              let cStart = new Date(moment(scheduling.start_time).subtract({ hours: scheduling.travel_time_hours, minutes: scheduling.travel_time_minutes }).format('YYYY-MM-DD HH:mm'));
              let cEnd = aStart;

              if (
                range.contains(cStart) || range.contains(cEnd)
              ) {
                canAdd.valid = false;
                canAdd.error = `${this.trans.save_conflict_two}`;
              }

            }



          });

          if (canAdd.valid) {

            this.storage.get("schedule_types").then(schedule_types => {

              let currentScheduleType = schedule_types.filter((type) => {
                return type.is_travel == true;
              });

              console.log(schedule_types, currentScheduleType);
              let travelScheduling = {
                user_id: user.id,
                internal_id: new Date().getTime(),
                start_time: moment(scheduling.start_time).subtract({ hours: scheduling.travel_time_hours, minutes: scheduling.travel_time_minutes }).format('YYYY-MM-DD HH:mm'),
                end_time: moment(scheduling.start_time).subtract({ minutes: 1 }).format('YYYY-MM-DD HH:mm'),
                schedule_type: currentScheduleType[0].id,
                schedule_types: currentScheduleType[0],
                save_travel: false,
              };

              schedule.push(scheduling);
              schedule.push(travelScheduling);

              this.storage
                .set("schedule_" + this.api.currentUser.id, schedule)
                .then(() => {
                  loading.dismiss();
                  if (timeCheck) {
                    this.timeCheckAlert(timeCheck, 'laterSave');
                  } else {
                    this.laterSave();
                  }

                });
            });
          } else {
            loading.dismiss();
            this.errorSave(`${this.trans.save_conflict_three}`);
          }
        });
    }



  }

  async handleLimitCheck(scheduling: any) {
    console.log('VAI VALIDAR O LIMITE');
    let frequency = this.client.frequency_info;
    let isContract = scheduling.schedule_types.is_contract;
 

    const start_time = moment(scheduling.start_time);
    const end_time = moment(scheduling.end_time);

    const startOfMonth = start_time.startOf('month').startOf('day').format('YYYY-MM-DD HH:mm:ss');;
    const endOfMonth = start_time.endOf('month').endOf('day').format('YYYY-MM-DD HH:mm:ss');

    if (frequency.allow_exceed) {
      return true;
    }

    if (!isContract) {
      return true;
    }
    const schedules: any = await this.storage.get('schedule_' + this.api.currentUser.id);
    let monthSchedules = [];

    if (schedules && schedules.length) {
      monthSchedules = schedules
        .filter(item => 

            moment(item.start_time, 'YYYY-MM-DD HH:mm:ss').isBetween(startOfMonth, endOfMonth, null, '[]')
            && item.contract_id == scheduling.contract_id
            && item.schedule_types.is_contract
        );

      let finalScheduleCount = monthSchedules.length > this.client.schedule_count ? monthSchedules.length : monthSchedules.length;

      console.log('FILTERED_SCHEDULES', monthSchedules);

      if (frequency.type == 1) {
        if (finalScheduleCount > 0 && finalScheduleCount >= frequency.frequency) {
          return false;
        }
      } else if (frequency.type == 2) {
        if (finalScheduleCount >= 1) {
          return false;
        }
      }

      return true;
    } else {
      return true;
    }

  }

  getRightDayToUse(start: any, previousTime: string, currentTime: string) {
    const format = "YYYY-MM-DD HH:mm:ss";
    const previousTimeParse = previousTime.split(":").join('');
    const currentTimeParse = currentTime.split(":").join('');
    if (parseInt(previousTimeParse) > parseInt(currentTimeParse)) {
      start.add('day', 1);
    }

    return moment(start.format('YYYY-MM-DD') + " " + currentTime, format);

  }

  async handleTimeCheck(scheduling: any) {


    if (this.api.isConnected()) {


      const start = moment(scheduling.start_time),
        end = moment(scheduling.end_time);


      let currentDay = this.dayNames[start.weekday()];

      let timesToCheck = [];

      Object.keys(this.workSchedule).forEach(key => {
        if (key.includes(currentDay)) {
          let index = 0;
          if (key.includes('e1')) index = 0
          if (key.includes('s1')) index = 1
          if (key.includes('e2')) index = 2
          if (key.includes('s2')) index = 3
          timesToCheck[index] = this.workSchedule[key];
        }
      });

      const supervisorLimit = moment.duration(this.workSchedule.overtime_limit);
      const gdLimit = moment.duration(this.workSchedule.gd_limit);

      const format = "YYYY-MM-DD HH:mm:ss";

      const startMath = moment(scheduling.start_time);
      const beforeTime1 = moment(startMath.format('YYYY-MM-DD') + " " + timesToCheck[0], format);
      const afterTime1 = this.getRightDayToUse(startMath, timesToCheck[0], timesToCheck[1]);
      const beforeTime2 = this.getRightDayToUse(startMath, timesToCheck[1], timesToCheck[2]);
      const afterTime2 = this.getRightDayToUse(startMath, timesToCheck[2], timesToCheck[3]);


      if (start.isBefore(beforeTime1)) {
        let duration = moment.duration(beforeTime1.diff(start));
        if (duration.asHours() > supervisorLimit.asHours() && duration.asHours() < gdLimit.asHours()) {
          console.log('O início é maior que 2 horas pedir autorização para o supervisor');
          return {
            exceed: true,
            message: 'Este agendamento excede sua jornada e tolerância. Aguarde a aprovação do seu supervisor para poder iniciar o atendimento.',
            type: 'supervisor',
            timeExceed: this.convertMinsToHrsMins(duration.asMinutes()),
            workSchedule: timesToCheck
          };
        } else if (duration.asHours() >= gdLimit.asHours()) {
          console.log('O início é maior que 4 horas pedir autorização para o GD');
          return {
            exceed: true,
            message: 'Este agendamento excede sua jornada e tolerância. Aguarde a aprovação do seu Supervisor/GD para poder iniciar o atendimento.',
            type: 'gd',
            timeExceed: this.convertMinsToHrsMins(duration.asHours()),
            workSchedule: timesToCheck
          };
        } else {
          console.log('Dentro da tolerância');
          return null;
        }
      } else if (start.isBetween(beforeTime1, afterTime2, null, '[]') && end.isAfter(afterTime2)) {
        let duration = moment.duration(end.diff(afterTime2));
        if (duration.asHours() > supervisorLimit.asHours() && duration.asHours() < gdLimit.asHours()) {
          return {
            exceed: true,
            message: 'Este agendamento excede sua jornada e tolerância. Aguarde a aprovação do seu supervisor para poder iniciar o atendimento.',
            type: 'supervisor',
            timeExceed: this.convertMinsToHrsMins(duration.asMinutes()),
            workSchedule: timesToCheck
          };
        } else if (duration.asHours() >= gdLimit.asHours()) {
          return {
            exceed: true,
            message: 'Este agendamento excede sua jornada e tolerância. Aguarde a aprovação do seu supervisor/GD para poder iniciar o atendimento.',
            type: 'gd',
            timeExceed: this.convertMinsToHrsMins(duration.asMinutes()),
            workSchedule: timesToCheck
          };
        } else {
          console.log('Dentro da tolerância');
          return null
        }
      } else if (start.isAfter(afterTime2)) {
        let durationStart = moment.duration(start.diff(afterTime2)).asHours();
        let durationEnd = moment.duration(end.diff(afterTime2)).asHours();

        let totalDuration = durationStart + durationEnd;

        if (totalDuration > supervisorLimit.asHours() && totalDuration < gdLimit.asHours()) {
          console.log('A soma é maior que 2 horas pedir autorização para o supervisor');
          return {
            exceed: true,
            message: 'Este agendamento excede sua jornada e tolerância. Aguarde a aprovação do seu supervisor para poder iniciar o atendimento.',
            type: 'supervisor',
            timeExceed: this.convertMinsToHrsMins(totalDuration),
            workSchedule: timesToCheck
          };
        } else if (totalDuration >= gdLimit.asHours()) {
          console.log('A soma é maior que 4 horas pedir autorização para o GD');
          return {
            exceed: true,
            message: 'Este agendamento excede sua jornada e tolerância. Aguarde a aprovação do seu supervisor/GD para poder iniciar o atendimento.',
            type: 'gd',
            timeExceed: this.convertMinsToHrsMins(totalDuration),
            workSchedule: timesToCheck
          };
        } else {
          console.log('Dentro da tolerância');
          return null
        }
      }
    }

    return null;
  }

  convertMinsToHrsMins = (mins) => {
    let h: any = Math.floor(mins / 60);
    let m: any = mins % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
  }

  timeCheckAlert(data, cb: any) {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false,
    });
    alert.setTitle(this.trans.attention);
    alert.setMessage(data.message);

    alert.addButton({
      text: "OK",
      role: "error",
      handler: () => {
        this[cb]();
      }
    });
    alert.present();
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
    alert.setTitle("Atenção!");
    alert.setMessage(msg);
    alert.addButton({
      text: "OK",
      handler: data => { }
    });
    alert.present();
  }
}
