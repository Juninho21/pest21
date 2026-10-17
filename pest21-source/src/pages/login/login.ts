import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FirebaseMessaging } from '@ionic-native/firebase-messaging';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, MenuController, NavController, Platform } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { HomePage } from './../home/home';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  @ViewChild('loginForm') loginForm: NgForm;
  username: any = "";
  password: string = ""
  token: any;
  translatedContent: any = {};
  constructor(
    public translate: TranslateService,
    public api: ApiProvider,
    public menu: MenuController,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public storage: Storage,
    private firebaseMessaging: FirebaseMessaging,
    public loadingCtrl: LoadingController) {
    this.menu.enable(false);

    translate.onLangChange.subscribe(res => {
      this.getLanguage();
    });
    this.getLanguage();
  }

  getLanguage() {
    this.translate.get('login').subscribe(res => {
      console.log(res);
      this.translatedContent = res;
    });
  }



  showRadio() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Language selector');

    alert.addInput({
      type: 'radio',
      label: 'Português',
      value: 'pt-br',
      checked: this.translate.currentLang == 'pt-br'
    });
    alert.addInput({
      type: 'radio',
      label: 'English',
      value: 'en',
      checked: this.translate.currentLang == 'en'
    });
    alert.addInput({
      type: 'radio',
      label: 'Espanol',
      value: 'es',
      checked: this.translate.currentLang == 'es'
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.translate.use(data);
      }
    });
    alert.present();
  }

  onSubmit(loginForm: NgForm) {

    if (!this.loginForm.invalid) {
      let loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
        content: this.translatedContent.loggin_in
      });
      loading.present().then(() => {
        this.api.login(this.username, this.password).then(data => {

          this.navCtrl.setRoot(HomePage, {}, { animate: true, direction: "foward" });


        }).catch(err => {
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title: this.translatedContent.authentication,
            message: this.translatedContent.invalid_user_pass,
            enableBackdropDismiss: false,
            buttons: ['OK']
          });
          alert.present();
        });

      })
    }
  }


  forgotPassword() {

    let alert = this.alertCtrl.create({
      title: this.translatedContent.forgot_password_modal,
      message: this.translatedContent.forgot_password_label,
      inputs: [
        {
          name: 'email',
          placeholder: 'E-mail',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: data => {
            if (data.email) {
              // logged in!

              this.api.sendForgotPassword(data.email).then(data => {
                console.log(data);
              }).catch(err => {
                console.log(err);
              })
            }
          }
        }
      ]
    });
    alert.present();
  }


}
