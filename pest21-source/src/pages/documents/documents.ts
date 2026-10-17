import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { DocumentFilePage } from './../document-file/document-file';

@Component({
  selector: 'page-documents',
  templateUrl: 'documents.html',
})
export class DocumentsPage {
  API_URL: string = 'https://sistema.ecolabpest21.com.br/api/';
  //API_URL:string = 'https://hml.ecolabpest21.com.br/api/'
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
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the ev target
    var val = ev.target.value;
    //console.log(val);

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.folders_old = this.folders_old.filter((item) => {
        return (item.name.toString().toLowerCase().indexOf(val.toString().toLowerCase()) > -1);
      })
    }
  }

  openDocumentsFile(folder) {
    this.navCtrl.push(DocumentFilePage, { folder });
  }

  ionViewDidEnter() {
    console.log('loading documents folder');

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Carregando, aguarde...'
    });

    loading.present().then(() => {

      this.initializeItems();

      return this.http.get(this.API_URL + 'folders').subscribe(response => {
        this.folders = response['folders'];
        this.folders_old = response['folders'];
        loading.dismiss();
      },
      err => {
        loading.dismiss();
        alert("Não foi possível conectar na api...");
      });
 
    });

  }


}
