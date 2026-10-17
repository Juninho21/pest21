import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the ServiceOrderNotesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-notes',
  templateUrl: 'service-order-notes.html',
})
export class ServiceOrderNotesPage {

  constructor(
    public storage: Storage,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public translate: TranslateService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderNotesPage');
  }

  save(info: string) {


    this.storage.get('service_order').then(os => {
      if (!os.comments) {
        os.comments = [];
      }

      os.comments.push(info);


      this.storage.set('service_order', os).then(data => {

        this.translate.get(['os_notes.success', 'attention']).subscribe(res => {


          let alert = this.alertCtrl.create({
            title: res.attention,
            message: res['os_notes.success'],
            enableBackdropDismiss: false
          });

          alert.addButton({
            text: 'OK',
            handler: data => {

              this.navCtrl.pop();
            }
          });
          alert.present();

        });
      })
    })




  }
}
