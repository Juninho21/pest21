import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { DocumentsPage } from '../documents/documents';
import { ProceduresPage } from '../procedures/procedures';

@Component({
  selector: 'page-types-documents',
  templateUrl: 'types-documents.html',
})
export class TypesDocuments {
  translatedContent: any = {};
  constructor
  (
    public translate: TranslateService,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public storage: Storage,
    public loadingCtrl: LoadingController
  ) 
  {
  }

  openDocuments() {
    this.navCtrl.push(DocumentsPage);
  }

  openProcedures() {
    this.navCtrl.push(ProceduresPage);
  }

  ionViewDidEnter() {
    console.log('entre page documents');

  }


}
