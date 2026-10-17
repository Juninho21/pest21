import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

/**
 * Generated class for the DeviceCheckerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'device-checker',
  templateUrl: 'device-checker.html'
})
export class DeviceCheckerComponent {

  selector:boolean = false;
  devices:any = [];
  constructor(public navParams: NavParams, public viewCtrl: ViewController) {
    console.log('Hello DeviceCheckerComponent Component');
    
    console.log('Devices', this.navParams.get('devices'));  


  }
  ionViewDidLoad(){
    this.devices = this.navParams.get('devices');
  }

  selectAll(value){
    this.devices.map(function(x) { 
      x.checked = value; 
    });
    this.selector = !this.selector ;
  }

  closeModal(){
    this.devices.forEach(device => {
        if(device.checked){
          device.confirmed = true;
        }
    });

    console.log('Filter', this.devices);
 
    this.viewCtrl.dismiss(this.devices);
  }

}
