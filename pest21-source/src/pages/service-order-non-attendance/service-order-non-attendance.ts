import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Diagnostic } from "@ionic-native/diagnostic";
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import {
  ActionSheetController,
  AlertController, LoadingController, NavController,
  NavParams,


  Platform
} from "ionic-angular";
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import "moment/locale/pt-br";
import { NetworkServiceProvider } from "../../providers/network-service/network-service";
import { ApiProvider } from "./../../providers/api/api";
import { HomePage } from "./../home/home";


//moment.locale("pt-br");
const newMoment = extendMoment(moment);
/**
 * Generated class for the ServiceOrderNonAttendancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-service-order-non-attendance",
  templateUrl: "service-order-non-attendance.html"
})
export class ServiceOrderNonAttendancePage {
  @ViewChild('galleryInput') galleryInput: ElementRef;
  attendance_reasons: any = [];
  scheduling: any = {};
  travel_time: any = "00:01";
  picture: any;
  minDate: any = moment(new Date()).format("YYYY-MM-DDTHH:mm");
  currentServiceOrder: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    private diagnostic: Diagnostic,
    public networkService: NetworkServiceProvider,
    public platform: Platform,
    private geolocation: Geolocation,
    private openNativeSettings: OpenNativeSettings,
    public actionSheetCtrl: ActionSheetController,
    public photoViewer: PhotoViewer,
    public camera: Camera
  ) {
    this.scheduling = this.navParams.get("scheduling");

    this.storage.get("attendance_reasons").then(data => {
      this.attendance_reasons = data;
    });

    this.storage.get("service_order").then(data => {
      this.currentServiceOrder = data;
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ServiceOrderNonAttendancePage");
  }

  presentActionSheet() {
    this.translate.get(['os_noncompliance.add_pictures', 'camera', 'gallery', 'cancel']).subscribe(res => {
      const actionSheet = this.actionSheetCtrl.create({
        title: res['os_noncompliance.add_pictures'],
        buttons: [
          {
            text: res['camera'],
            handler: () => {
              console.log('Camera clicked');
              this.openCamera();
            }
          },
          {
            text: res['gallery'],
            handler: () => {
              console.log('Gallery clicked');
              this.openGalleryPicker();
            }
          },
          {
            text: res['cancel'],
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      actionSheet.present();

    });
  }

  async openCamera() {
    if (!this.platform.is('cordova')) {
      return;
    }

    try {
      const permission = this.diagnostic.permission.CAMERA;
      const status = await this.diagnostic.getPermissionAuthorizationStatus(permission);

      if (status === this.diagnostic.permissionStatus.GRANTED) {
        this.takePicture(this.camera.PictureSourceType.CAMERA);
        return;
      }

      const requestStatus = await this.diagnostic.requestRuntimePermission(permission);
      if (requestStatus === this.diagnostic.permissionStatus.GRANTED) {
        this.takePicture(this.camera.PictureSourceType.CAMERA);
        return;
      }

      this.alertCameraPermission();
    } catch (err) {
      console.log('Erro ao solicitar permissão da câmera:', err);
      this.alertCameraPermission();
    }
  }

  takePicture(fromType: number) {

    const options: CameraOptions = {
      quality: 80,
      targetWidth: 640,
      targetHeight: 640,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: fromType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }

    console.log('OPÇÕES DA CÂMERA', options);

    this.camera.getPicture(options).then(async (imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;

      if (fromType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        base64Image = await this.normalizeDataUrlToJpeg(base64Image);
      }

      this.picture = base64Image;
    }, (err) => {
      // Handle error
      console.log(err);
    });

  }

  alertCameraPermission() {
    const alert = this.alertCtrl.create({
      title: 'Permissão necessária',
      message: 'Permita o uso da câmera para tirar foto.',
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Configurações',
          handler: () => {
            this.openNativeSettings.open('application_details');
          }
        }
      ]
    });

    alert.present();
  }

  openGalleryPicker() {
    if (this.galleryInput && this.galleryInput.nativeElement) {
      this.galleryInput.nativeElement.value = '';
      this.galleryInput.nativeElement.click();
    }
  }

  async onGallerySelected(event: any) {
    const file = event && event.target && event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const fileDataUrl = await this.readFileAsDataUrl(file);
      this.picture = await this.normalizeDataUrlToJpeg(fileDataUrl);
    } catch (err) {
      console.log('Erro ao processar imagem da galeria:', err);
    }
  }

  readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsDataURL(file);
    });
  }

  normalizeDataUrlToJpeg(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const maxWidth = 640;
        const maxHeight = 640;
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1);
        const width = Math.round(sourceWidth * scale);
        const height = Math.round(sourceHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          resolve(dataUrl);
          return;
        }

        context.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    });
  }

  openPicture(url) {
    this.translate.get('os_noncompliance.no_conformity').subscribe(res => {
      this.photoViewer.show(url, res, { share: false });
    })

  }

  async save(form: NgForm) {

    let loading = this.loadingCtrl.create({
      content: ""
    });

    await loading.present();
    let serverTime: any = null;
    let resp: Geoposition = null;

    try {

      if (this.api.isConnected) {
        serverTime = await this.api.getServerTime();
      } else {
        serverTime = null;
      }
      resp = await this.geolocation.getCurrentPosition({ timeout: 8000, maximumAge: 60000 });
    } catch (err) {
      console.log('DEU ERRO PRA PEGAR O LOCATION', err);
    }

    this.translate.get('inform_non_attendance').subscribe(trans => {

      loading.setContent(trans.updating);
      let data = form.control.getRawValue();
      data.attendance_reason = data.attendance_reason.id;
      data.contract_id = this.scheduling.contract_id;
      data.client_id = this.scheduling.contract.client_id;
      data.location = resp ? [resp.coords.latitude, resp.coords.longitude] : [0, 0];
      data.datetimeScheduling = this.scheduling.start_time;
      data.dateTimeStart = new Date();
      data.servertimeStart = serverTime ? new Date(serverTime.server_time) : null;
      data.gpstimeStart = resp && resp.timestamp ? new Date(resp.timestamp) : null;
      data.synced = false;
      data.scheduling_id = this.scheduling.id;

      if (this.picture) {
        data.picture = this.picture;
      }

      data.id = this.scheduling.contract.branch.os_number + 1;

      this.api
        .saveNonAttendance(data)
        .subscribe(response => {
          console.log(response);
          this.api.getSchedule();


          if (this.currentServiceOrder && this.currentServiceOrder.scheduling_id == this.scheduling.id) {
            this.storage.remove("service_order").then(() => {
              this.navCtrl.setRoot(HomePage);
              loading.dismiss();
            });
          } else {
            this.navCtrl.setRoot(HomePage);
            loading.dismiss();
          }

        }, err => {
          loading.dismiss();
          this.errorSave(trans.error);
        });
      console.log(data);
    });


  }

  errorSave(msg) {
    this.translate.get('attention').subscribe(res => {
      let alert = this.alertCtrl.create();
      alert.setTitle(res);
      alert.setMessage(msg);
      alert.addButton({
        text: "OK",
        handler: data => { }
      });
      alert.present();
    });
  }
}
