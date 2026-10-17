import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { IntervalFormPage } from '../interval-form/interval-form';
import { ScheduleUpdatePage } from '../schedule-update/schedule-update';
import { ServiceOrderDetailsPage } from '../service-order-details/service-order-details';
import { ApiProvider } from './../../providers/api/api';
/**
 * Generated class for the CalendarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {
  eventSource: any;
  isToday: boolean;
  viewTitle;
  started: boolean = false;
  calendar: any = {
    mode: 'month',
    locale: this.translate.currentLang,
    currentDate: new Date(),
    dateFormatter: {
      formatMonthViewDay: function (date: Date) {
        return date.getDate().toString();
      },
      formatMonthViewDayHeader: function (date: Date) {
        return moment(date).locale(this.translate.currentLang).format("ddd");
      },
      formatMonthViewTitle: function (date: Date) {
        return 'testMT';
      },
      formatWeekViewDay: function (date: Date) {
        return date.getDate().toString();
      },
      formatWeekViewDayHeader: function (date: Date) {
        return moment(date).locale(this.translate.currentLang).format("ddd DD/MM");
      },
      formatWeekViewTitle: function (date: Date) {
        return 'testWT';
      },
      formatWeekViewHourColumn: function (date: Date) {

        return moment(date).locale(this.translate.currentLang).format("HH:mm");
      },
      formatDayViewHourColumn: function (date: Date) {
        return moment(date).locale(this.translate.currentLang).format("HH:mm");
      },
      formatDayViewTitle: function (date: Date) {
        return 'testDT';
      }
    }
  };

  now: Date;

  constructor(public translate: TranslateService, public api: ApiProvider, public loadingCtrl: LoadingController, public datePipe: DatePipe, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public storage: Storage) {

    this.calendar = {
      mode: 'month',
      locale: this.translate.currentLang,
      currentDate: new Date(),
      dateFormatter: {
        formatMonthViewDay: (date: Date) => {
          return date.getDate().toString();
        },
        formatMonthViewDayHeader: (date: Date) => {
          return moment(date).locale(this.translate.currentLang).format("ddd");
        },
        formatMonthViewTitle: (date: Date) => {
          return moment(date).locale(this.translate.currentLang).format("MMMM");
        },
        formatWeekViewDayHeader: (date: Date) => {
          return moment(date).locale(this.translate.currentLang).format("ddd DD");
        },
        formatWeekViewTitle: (date: Date) => {
          return moment(date).locale(this.translate.currentLang).format("MMMM");
        },
        formatWeekViewHourColumn: (date: Date) => {

          return moment(date).locale(this.translate.currentLang).format("HH:mm");
        },
        formatDayViewHourColumn: (date: Date) => {
          return moment(date).locale(this.translate.currentLang).format("HH:mm");
        },
        formatDayViewTitle: (date: Date) => {
          return this.datePipe.transform(date, 'dd/MM/yyyy');
        }
      }
    };

  }

  getTypeClass(sc: any) {

    if (sc.is_contract) {
      return 'type_contract';
    } else if (sc.is_single) {
      return 'type_single';
    } else if (sc.is_emergency) {
      return 'type_emergency';
    } else if (sc.is_travel) {
      return 'type_travel';
    } else if (sc.is_vacation) {
      return 'type_vacation';
    } else if (sc.is_implementation) {
      return 'type_implementation';
    } else if (sc.is_third_parties) {
      return 'type_third_parties';
    } else {
      return '';
    }

  }

  contracts: any = [];

  async ionViewDidLoad() {
    console.log('ionViewDidLoad CalendarPage');
    //this.eventSource = this.createRandomEvents();

    this.contracts = await this.storage.get('clients');
    this.createRandomEvents();

    setInterval(() => {
      this.now = new Date();

    }, 1000);
  }



  getTravelTime(time) {
    let totalMinutes = time;
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    return hours + ":" + minutes;
  }

  getScheduleStatus(schedule) {


    if (schedule.os_id && schedule.synced && !schedule.non_attendance) {
      return { text: '[Executado]', icon: 'md-done-all' };
    } else if (schedule.os_id && schedule.synced && schedule.non_attendance) {
      return { text: '[Não Atendimento]', icon: 'md-remove-circle' };
    } else if (schedule.delayed) {
      return { text: '[No-Show]', icon: 'md-close-circle' };
    } else {
      return { text: '[Aguardando Atendimento]', icon: 'md-time' };
    }



  }

  convertMinsToHrsMins = (mins) => {
    let h: any = Math.floor(mins / 60);
    let m: any = mins % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
  }
  update() {

    this.translate.get(['attention', 'calendar']).subscribe(res => {
      //console.log(res);
      if (this.api.isConnected()) {
        let loading = this.loadingCtrl.create({
          dismissOnPageChange: true,
          content: res.calendar.updating
        });
        loading.present().then(() => {
          this.api.getPestsInfo().then(() => {
            this.api.getSchedule().then(() => {
              this.createRandomEvents();
              loading.dismiss();
            }).catch(err => {
              console.log(err);
            });
          });

        });

      } else {
        let alert = this.alertCtrl.create();
        alert.setTitle(res.attention);
        alert.setMessage(res.calendar.internet_warning)
        alert.addButton({
          text: 'OK',
          handler: data => {
            console.log(data);
          }
        });
        alert.present();
      }
    });
  }

  openServiceOrder() {
    this.navCtrl.push(ServiceOrderDetailsPage);
  }


  openAlterSchedule(data) {
    this.navCtrl.push(ScheduleUpdatePage, { schedule: data });
  }
  createRandomEvents() {

    this.eventSource = [];



    this.storage.get('schedule_' + this.api.currentUser.id).then(schedule => {

      //console.log(schedule);

      if (schedule) {

        var events = [];

        schedule.forEach((point, index) => {

          //console.log(point);
          point.schedule_contract = point.contract
          point.contract = this.contracts.find(contract => contract.id == point.contract_id);

          if (point.contract) {
            let startTime = new Date(point.start_time.replace('T', " ").replace('Z', ""));
            let endTime = new Date(point.end_time.replace('T', " ").replace('Z', ""));

            if (endTime.getTime() == startTime.getTime()) {
              endTime.setHours(startTime.getHours() + 1);
            }

            events.push({
              title: point.contract.client.fantasy_name,
              startTime: startTime,
              endTime: endTime,
              allDay: false,
              data: {
                scheduling: point,
                clientCode: point.contract.client.code,
                socialName: point.contract.client.social_name,
                fantasy_name: point.contract.client.fantasy_name,
                address: point.contract.client.street,
                neighborhood: point.contract.client.district,
                city: point.contract.client.city,
                uf: point.contract.client.state,
                os_number: point.contract.branch.os_number + 1
              }
            });
          } else {
            let startTime = new Date(point.start_time.replace('T', " ").replace('Z', ""));
            let endTime = new Date(point.end_time.replace('T', " ").replace('Z', ""));

            if (endTime.getTime() == startTime.getTime()) {
              endTime.setHours(startTime.getHours() + 1);
            }
            console.log('AQUI Ó: ' + index, point);
            events.push({
              title: 'Intervalo',
              startTime: startTime,
              endTime: endTime,
              allDay: false,
              data: {
                scheduling: point,
                clientCode: null,
                socialName: null,
                address: null,
                neighborhood: null,
                city: null,
                uf: null,
                os_number: null
              }
            });
          }
        });


        this.eventSource = events;

      }



    });
  }

  setTimeInterval() {
    this.navCtrl.push(IntervalFormPage);
  }
  getDDD(data) {
    //console.log(data);
    return data;
  }

  onViewTitleChanged(title) {
    //console.log(title);
    this.viewTitle = title;
  }

  onEventSelected(event: any) {
    if (event.data.scheduling && event.data.scheduling.schedule_type < 4) {
      if (!event.data.scheduling.os_id && !event.data.scheduling.synced)
        this.navCtrl.push(ServiceOrderDetailsPage, { scheduling: event.data.scheduling });
      //console.log('Event selected:', event);
    }
  }

  changeMode(mode) {
    this.calendar.mode = mode;
    this.createRandomEvents();
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  onTimeSelected(ev) {
    /*console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);*/

    /*if(!this.started){
      this.started = true;
      return;
    }

    if(ev.events && ev.events.length > 0 && this.calendar.mode == 'month'){

      if(ev.events.length == 1) {
        this.navCtrl.push(ServiceOrderDetailsPage);
        return;
      }
      let alert = this.alertCtrl.create();
        alert.setTitle('Agendamentos');

       
        
        ev.events.forEach(event => {
          alert.addInput({
            type: 'radio',
            label: event.title,
            value: event,
            checked: true
          });
        });

        alert.addButton('Cancelar');
        alert.addButton({
          text: 'CONFIRMAR',
          handler: data => {
            this.navCtrl.push(ServiceOrderDetailsPage);
          }
        });
        alert.present();


    }*/
  }

  openOS(data) {
    //console.log(data.scheduling);
    this.navCtrl.push(ServiceOrderDetailsPage, { scheduling: data.scheduling });
  }

  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  settings() {

    this.translate.get(['cancel', 'attention', 'calendar']).subscribe(res => {
      let alert = this.alertCtrl.create();
      alert.setTitle(res.calendar.change_schedule);

      alert.addInput({
        type: 'radio',
        label: res.calendar.monthly,
        value: 'month',
        checked: true
      });
      alert.addInput({
        type: 'radio',
        label: res.calendar.weekly,
        value: 'week',
        checked: false
      });
      alert.addInput({
        type: 'radio',
        label: res.calendar.daily,
        value: 'day',
        checked: false
      });

      alert.addButton(res.cancel);
      alert.addButton({
        text: 'OK',
        handler: data => {

          this.calendar.mode = data;
        }
      });
      alert.present();
    });
  }

}
