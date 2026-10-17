import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { ApiProvider } from './../../providers/api/api';
/**
 * Generated class for the ServiceOrderOfflinePoolPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-offline-pool',
  templateUrl: 'service-order-offline-pool.html',
})
export class ServiceOrderOfflinePoolPage {

  serviceOrders: any = [];
  onlineServiceOrders: any = [];
  uploading: boolean = false;
  selector: any = 'offline';
  isOnline: boolean = false;
  scheduler: Subscription;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navParams: NavParams, public storage: Storage, public api: ApiProvider) {
    this.isOnline = this.api.isConnected();
  }


  /* async getServiceOrders () {
    let osPool = await this.storage.get('os_pool_' + this.api.currentUser.id);
    if (osPool && osPool.length) {
      this.storage.get('clients').then(clients => {
        this.setData(osPool, clients);
      });
    }

    return osPool;
  }*/

  checkCanSupport(os){

    let now = moment(new Date()); //todays date
    let end = moment(os.datetimeEnd); // another date
    let duration = moment.duration(now.diff(end));
    if(duration.asHours() >= 4){
      return true;
    }
    return false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientsPage');

    this.storage.get('os_pool_' + this.api.currentUser.id).then(osPool => {
      if (osPool && osPool.length) {
        this.storage.get('clients').then(clients => {
          this.setData(osPool, clients);
        });
      }else {
        this.serviceOrders = [];
      }
    });


    this.scheduler = Observable.interval(5000).subscribe(() => {
      this.alertCtrl
      if (this.api.currentUser && this.api.currentUser.id) {
        this.storage.get('os_pool_' + this.api.currentUser.id).then(osPool => {
          if (osPool && osPool.length) {
            this.storage.get('clients').then(clients => {
              this.setData(osPool, clients);
            });
          } else {
            this.serviceOrders = [];
          }
        });
      }
    });


    this.api.getServiceOrders().map(res => res.service_orders).subscribe(data => {
      console.log(data);
      this.onlineServiceOrders = data;
    });


  }

  ionViewWillLeave(){
    this.scheduler.unsubscribe();
  }

  doRefresh(event){
    this.onlineServiceOrders = [];
    this.api.getServiceOrders().map(res => res.service_orders).subscribe(data => {
      console.log(event);
      this.onlineServiceOrders = data;
      event.complete();
    });
  }

  segmentChanged($event){
    console.log($event);

    this.selector = $event.value;
  }



  osDelete(os, index){

    let alert = this.alertCtrl.create();
          alert.setTitle('Atenção!');
          alert.setMessage('Isso irá remover a O.S. do dispositivo! <br><br> Se ela não tiver sincronizada você perderá estes dados. <br><br> Somente prossiga com a remoção se a O.S. já tiver sido ENVIADA ou se o suporte lhe orientou a fazer isso!');
          alert.addButton({
            text: 'CANCELAR',
            handler: data => {
            }
          });
          alert.addButton({
            text: 'REMOVER',
            handler: data => {
              let loading = this.loadingCtrl.create({
                dismissOnPageChange: true,
                enableBackdropDismiss: false,
                content: 'Removendo do dispositivo...'
              });
              loading.present().then(() => {
                this.api.saveOs(os).then(data => {
                  this.serviceOrders.splice(index, 1);
                  this.storage.set('os_pool_' + this.api.currentUser.id, this.serviceOrders).then(() => {
                    loading.dismiss();
                  });
                });
              }).catch(err => {
                loading.dismiss();
              });
            }
          });
          alert.present();


    

  }

  osSupport(os:any){
    
    if(!this.api.isConnected()){
      let alert = this.alertCtrl.create();
          alert.setTitle('Atenção!');
          alert.setMessage('Você precisa estar conectado para solicitar suporte!');
          alert.addButton({
            text: 'OK',
            handler: data => {
              this.uploading = false;
            }
          });
          alert.present();

          return;
    }
    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      enableBackdropDismiss: false,
      content: 'Enviando Dados para o suporte...'
    });
    loading.present().then(() => {
      this.api.osSupport(os).then(data => {
        console.log(data);
        loading.dismiss();
        let alert = this.alertCtrl.create();
          alert.setTitle('Atenção!');
          alert.setMessage('Solicitação criada com sucesso!');
          alert.addButton({
            text: 'OK',
            handler: data => {
              this.uploading = false;
            }
          });
          alert.present();
      }).catch(err => {
        console.error(err);
      });
      
    }).catch(err => {
      loading.dismiss();
    });
  }

  setData(osPool, clients) {

    osPool.forEach(os => {
      clients.forEach(client => {
        if (os.client_id == client.client_id) {
          os.client = client.client;
        }

      });

    });

    this.serviceOrders = osPool;

  }

  saveOs(os, index) {

    let loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      enableBackdropDismiss: false,
      content: 'Salvando Ordem de serviço...'
    });

    
    loading.present().then(() => {
      this.api.saveOs(os).then(data => {
        this.serviceOrders[index]['saved'] = true;
        this.storage.set('os_pool_' + this.api.currentUser.id, this.serviceOrders).then(() => {
          loading.dismiss();
          let alert = this.alertCtrl.create();
          alert.setTitle('Atenção!');
          alert.setMessage('Ordem de Serviço enviada com sucesso!');
          alert.addButton({
            text: 'OK',
            handler: data => {
              this.uploading = false;
              this.storage.get('os_pool_' + this.api.currentUser.id).then(osPool => {
                if (osPool && osPool.length) {
                  this.storage.get('clients').then(clients => {
                    this.setData(osPool, clients);
                  });
                }
              });
            }
          });
          alert.present();
        });
      }).catch(err => {
        console.log(err);
        loading.dismiss();
        let alert = this.alertCtrl.create();
        alert.setTitle('Atenção!');
        alert.setMessage('Não foi possível sincronizar a Ordem de serviço, tente novamente!')
        alert.addButton({
          text: 'OK',
          handler: data => {
            this.uploading = false;
          }
        });
        alert.present();
      })

    });
  }



}
