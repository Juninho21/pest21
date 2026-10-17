import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  platformName:any = "";
  platformVersion:any = "";
  appVersionNumber:any = "000";
  appVersionCode:any = "000";
  ionicProVersionNumber:any = process.env.CI_GIT_COMMIT_SHA || '0.0.3'
  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private appVersion: AppVersion) {
    if (this.platform.is('ios')) {
      // This will only print when on iOS
       console.log('I am an iOS device!');
       this.platformName = 'iOs';
     }
     if (this.platform.is('android')) {
      // This will only print when on Android
       console.log('I am an android device!');
       this.platformName = 'Android';
       
      }
      this.appVersion.getVersionNumber().then(version => {
        this.appVersionNumber = version;
      }).catch(err => {
        console.log(err);
      });
      this.appVersion.getVersionCode().then(version => {
        this.appVersionCode = version;
      }).catch(err => {
        console.log(err);
      });
   
      this.platformVersion =  this.platform.version().str;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
