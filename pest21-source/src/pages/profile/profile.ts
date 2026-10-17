import { HomePage } from './../home/home';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { Storage } from '@ionic/storage';
import { NgForm } from '@angular/forms';


/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var SignaturePad;

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  @ViewChild('canvas') canvas: ElementRef;

  signaturePad: any;
  signature: string = null;
  user: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public storage: Storage, public loadingCtrl: LoadingController, public api: ApiProvider) {


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderFinishPage');

    this.storage.get('user').then(user => {
      if(user){
        this.user = user;
        this.user.telephone = this.user.telephone;
      }
    });

  }

  initSignature(checked) {
    if(checked){
    setTimeout(() => {
      this.signaturePad = new SignaturePad(this.canvas.nativeElement, {
        onEnd: () => {
          this.signature = this.signaturePad.toDataURL();
          console.log(this.signature);
        }
      });

      var ratio = Math.max(window.devicePixelRatio || 1, 1);
      this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth * ratio;
      this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight * ratio;
      this.canvas.nativeElement.getContext("2d").scale(ratio, ratio);
      this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
      this.signaturePad.on(data => {
        console.log('TESTE', data);
      });
    }, 500);
  }
}

  toSignature() {
    console.log('END', this.signaturePad);
  }

  clearSignature() {

    this.signaturePad.clear();
    this.signature = null;
  }

  isEqual(password, reseat): boolean {

    console.log(password, reseat);
      if(!password || !reseat){
        return true;
      }

      if(password !== reseat){
        return false;
      }else {
        return true;
      }
  }
  save(form:NgForm) {
    if(form.valid){
      let data = form.control.getRawValue();
      data.signature = this.signature;
      this.api.updateUser(data).then(data => {
        this.navCtrl.setRoot(HomePage);
      }).catch(err => {
        console.log(err);
      })

    }

  }

}
