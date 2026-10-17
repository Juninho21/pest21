import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import { Platform, ToastController } from 'ionic-angular';
import { BehaviorSubject, Observable } from 'rxjs';


export enum ConnectionStatus {
  Online,
  Offline
}

@Injectable()
export class NetworkServiceProvider {

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);

  constructor(private network: Network, private toastController: ToastController, private plt: Platform, public translate: TranslateService) {
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      let status = this.getNetworkType() !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  private hasNetworkPlugin(): boolean {
    return !!(this.plt.is('cordova') && (window as any).cordova && (navigator as any).connection);
  }

  private getNetworkType(): string {
    if (this.hasNetworkPlugin()) {
      return this.network.type;
    }

    return navigator.onLine ? 'online' : 'none';
  }

  public initializeNetworkEvents() {

    if (!this.hasNetworkPlugin()) {
      window.addEventListener('online', () => {
        if (this.status.getValue() === ConnectionStatus.Offline) {
          this.updateNetworkStatus(ConnectionStatus.Online);
        }
      });

      window.addEventListener('offline', () => {
        if (this.status.getValue() === ConnectionStatus.Online) {
          this.updateNetworkStatus(ConnectionStatus.Offline);
        }
      });

      return;
    }

    this.network.onDisconnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Online) {
        console.log('VOCÊ ESTÁ OFFLINE');
        this.updateNetworkStatus(ConnectionStatus.Offline);
      }
    });

    this.network.onConnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Offline) {
        console.log('VOCÊ ESTÁ ONLINE');
        this.updateNetworkStatus(ConnectionStatus.Online);
      }
    });

    this.network.onchange().subscribe(() => {
      console.log('NETWORK TYPE VALENDO', this.getNetworkType());
    });
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);
    let connection = status == ConnectionStatus.Offline ? 'Offline' : 'Online';
    this.translate.get(["internet_append", 'calendar']).subscribe(trans => {
      let append = '';
      const networkType = this.getNetworkType();
      if (networkType != '3g' && networkType != '4g' && networkType != 'wifi' && connection != 'Offline') {

        append = trans['internet_append'];
      }


      let toast = this.toastController.create({
        message: `Você está ${connection}. ` + append,
        duration: 3000,
        position: 'bottom'
      });

      toast.present();

    });
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }
}
