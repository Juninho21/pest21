import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastController } from 'ionic-angular';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';

 
const STORAGE_REQ_KEY = 'storedreq';
 
interface StoredRequest {
  url: string,
  type: string,
  data: any,
  time: number,
  id: string
}
 
@Injectable()
export class OfflineManagerProvider {
 
  constructor(private storage: Storage, private http: HttpClient, private toastController: ToastController) { }
 
  checkForEvents(): Observable<any> {
    return from(this.storage.get(STORAGE_REQ_KEY)).pipe(
      switchMap(storedOperations => {
        let storedObj = JSON.parse(storedOperations);
        if (storedObj && storedObj.length > 0) {
          return this.sendRequests(storedObj).pipe(
            finalize(() => {
              let toast = this.toastController.create({
                message: `Os dados locais fora sincronizados com sucesso!`,
                duration: 3000,
                position: 'bottom'
              });
              toast.present();
              this.storage.remove(STORAGE_REQ_KEY);
            })
          );
        } else {
          console.log('no local events to sync');
          return of(false);
        }
      })
    )
  }
 
  storeRequest(url, type, data) {
    let toast = this.toastController.create({
      message: `Os dados fora salvos localmente pois você está offline.`,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
 
    let action: StoredRequest = {
      url: url,
      type: type,
      data: data,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 
    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations);
 
      if (storedObj) {
        storedObj.push(action);
      } else {
        storedObj = [action];
      }
      // Save old & new local transactions back to Storage
      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }
 
  sendRequests(operations: StoredRequest[]) {
    let obs = [];
 
    for (let op of operations) {
      console.log('Make one request: ', op);
      let oneObs;
      if(op.type == "POST"){
      oneObs = this.http.request(op.type, op.url, {body: op.data});
      }else {
        oneObs = this.http.request(op.type, op.url, op.data);
      }
      obs.push(oneObs);
    }
 
    // Send out all local events and return once they are finished
    return forkJoin(obs);
  }
}
