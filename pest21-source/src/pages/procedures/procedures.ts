import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ProceduresFilePage } from '../procedures-file/procedures-file';

@Component({
  selector: 'page-procedures',
  templateUrl: 'procedures.html',
})
export class ProceduresPage {
  API_URL: string = 'https://sistema.ecolabpest21.com.br/api/';
  folders: any = [];
  folders_old: any = [];
  search: any = "";
  translatedContent: any = {};
  items;
  constructor
  (
    public translate: TranslateService,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public storage: Storage,
    public http: HttpClient,
    public loadingCtrl: LoadingController
  ) 
  {
  }

  initializeItems() {
    this.folders_old = this.folders;
  }

  handleChange(ev) {
  
    this.initializeItems();

    var val = ev.target.value;
    //console.log(val);

    if (val && val.trim() != '') {
      this.folders_old = this.folders_old.filter((item) => {
        return (item.name.toString().toLowerCase().indexOf(val.toString().toLowerCase()) > -1);
      })
    }
  }

  openProceduresFile(folder) {
    this.navCtrl.push(ProceduresFilePage, { folder });
  }

  ionViewDidEnter() {
    console.log('loading documents folder');

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Carregando, aguarde...'
    });

    loading.present().then(() => {

      this.initializeItems();

      return this.http.get(this.API_URL + 'procedures').subscribe(response => {
        this.folders = response['folders'];
        this.folders_old = response['folders'];
        loading.dismiss();
      },
      err => {
        loading.dismiss();
        alert("Não foi possível conectar na api...");
      });
 
    }).catch(err => {
      loading.dismiss();
      console.log("this is error = ", err)
    });

  }


}
