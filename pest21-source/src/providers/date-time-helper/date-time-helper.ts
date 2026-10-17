import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker';

/*
  Generated class for the DateTimeHelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DateTimeHelperProvider {

  constructor(public http: HttpClient, public datePicker: DatePicker) {
    console.log('Hello DateTimeHelperProvider Provider');
  }


  getDate(mode: "date" | "time" | "datetime" = "date", date: Date = new Date(), minDate: any = "", maxDate: any = ""): Promise<any> {

    return this.datePicker.show({
      date,
      mode,
      androidTheme: 16974126,
      minDate,
      allowOldDates: false,
      maxDate,
      okText: "CONFIRMAR",
      cancelText: "CANCELAR",
      is24Hour: true,
      doneButtonLabel: "OK",
      cancelButtonLabel: "Cancelar",
      locale: "pt_BR",
    });

  }

  getMipDate(mode: "date" | "time" | "datetime" = "date", date: Date = new Date(), minDate: any = "", maxDate: any = ""): Promise<any> {

    return this.datePicker.show({
      date,
      mode,
      androidTheme: 16974126,
      minDate,
      allowOldDates: true,
      maxDate,
      okText: "CONFIRMAR",
      cancelText: "CANCELAR",
      is24Hour: true,
      doneButtonLabel: "OK",
      cancelButtonLabel: "Cancelar",
      locale: "pt_BR",
    });

  }

  getOldDate(mode: "date" | "time" | "datetime" = "date", date: Date = new Date(), minDate: any = "", maxDate: any = ""): Promise<any> {

    return this.datePicker.show({
      date,
      mode,
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_LIGHT,
      minDate,
      allowOldDates: false,
      maxDate,
      okText: "CONFIRMAR",
      cancelText: "CANCELAR",
      is24Hour: true,
      doneButtonLabel: "OK",
      cancelButtonLabel: "Cancelar",
      locale: "pt_BR",
    });

  }




}
