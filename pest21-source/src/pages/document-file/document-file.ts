import { Component } from '@angular/core';
import { NavParams, LoadingController, Platform } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';

@Component({
  selector: 'page-document-file',
  templateUrl: 'document-file.html',
})

export class DocumentFilePage {
  //files: any = [];
  API_URL: string = 'https://sistema.ecolabpest21.com.br/api/';
  //API_URL:string = 'https://hml.ecolabpest21.com.br/api/'
  folder: number;
  documents: any = [];
  documents_old: any = [];
  constructor(
    public navParams: NavParams,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private file: File,
    private nativeHTTP: HTTP,
    private fileOpener: FileOpener
  )
  {
    this.folder = this.navParams.get('folder');
  }
  
  initializeItems() {
    this.documents_old = this.documents;
  }

  handleChange(ev) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the ev target
    var val = ev.target.value;
    //console.log(val);

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.documents_old = this.documents_old.filter((item) => {
        return (item.name.toString().toLowerCase().indexOf(val.toString().toLowerCase()) > -1);
      })
    }
  }
  
  async ionViewDidLoad() {

    console.log('loadinf files page');
  
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Carregando, aguarde...'
    });

    loading.present().then(() => {

      return this.http.get(this.API_URL + 'folders/' +this.folder + '/documents').subscribe(response => {
        //console.log(response['documents']);
        this.documents = response['documents'];
        this.documents_old = response['documents'];
        loading.dismiss();
      });
 
    });
    
  }
  

  download(doc) {
      
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Fazendo Download...'
    });

    loading.present().then(() => {

      this.initializeItems();

      const url = this.API_URL+'folders/'+doc.folder_id+'/download/'+doc.hash_name+'.'+doc.ext
      const downloadPath = this.file.externalDataDirectory;
      console.log(downloadPath);

      var reqHeader = new HttpHeaders({ 
          'Content-Type': 'application/pdf',
          'Accept': '*/*',
          //'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token'))
       });
    
      return this.http.get(url, { headers: reqHeader, responseType: 'blob' })
      .subscribe(
        (fileBlob: Blob) =>{
          this.file.writeFile(downloadPath, doc.hash_name+'.'+doc.ext, fileBlob, {replace: true})
          .then(success => {
            console.log(success.nativeURL);
            this.fileOpener.open(success.nativeURL, 'application/pdf')
            .then(sucess => console.log(sucess))
            .catch(e => alert('Nenhum visualizador de PDF instalado.'));
            loading.dismiss();
          })
          .catch(err => alert('Falha ao baixar arquivo'));
          loading.dismiss();
        },
        err => {
          loading.dismiss();
          alert("Não foi possível conectar na api...");
        }
      );

      
 
    });    

  }

}
