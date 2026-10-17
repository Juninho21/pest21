import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController, AlertController, NavController, NavParams, Platform } from 'ionic-angular';

/**
 * Generated class for the NonCompliancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-non-compliance',
  templateUrl: 'service-order-non-compliance.html',
})
export class ServiceOrderNonCompliancePage {
  @ViewChild('galleryInput') galleryInput: ElementRef;
  sectors: any = [];
  types: any = [];
  problems: any = [];
  suggestedActionsList: any = [];
  pictures: any = [];
  constructor(
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public photoViewer: PhotoViewer,
    public alertCtrl: AlertController,
    public storage: Storage,
    public translate: TranslateService,
    public camera: Camera,
    private diagnostic: Diagnostic,
    private openNativeSettings: OpenNativeSettings,
    public platform: Platform) {


    this.storage.get('service_order').then(os => {
      if (os.services) {
        os.services.forEach(service => {
          service.sector.forEach(sector => {
            if (this.sectors.indexOf(sector) == -1) {
              this.sectors.push(sector);
            }
          });
        });
      } else {
        this.navCtrl.pop().then(data => {
          this.translate.get(['os_noncompliance.warning', 'attention']).subscribe(res => {
            console.log(res);
            let alert = this.alertCtrl.create({
              title: res.attention,
              message: res['os_noncompliance.warning'],
              enableBackdropDismiss: false
            });

            alert.addButton({
              text: 'OK',
              handler: data => {

              }
            });
            alert.present();
          })

        });
      }
    });
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
      const base64Image = await this.normalizeDataUrlToJpeg(fileDataUrl);
      this.pictures.push(base64Image);
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

    this.camera.getPicture(options).then(async (imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;

      if (fromType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        base64Image = await this.normalizeDataUrlToJpeg(base64Image);
      }

      this.pictures.push(base64Image)
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

  openPicture(url) {
    this.translate.get('os_noncompliance.no_conformity').subscribe(res => {
      this.photoViewer.show(url, res, { share: false });
    })

  }

  getFiltered(type, problems) {
    if (type && problems) {
      let problemsList = problems.filter(problem => {
        return problem['problem_type'] == type.id;
      });
      return problemsList.sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
    } else {
      return []
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NonCompliancePage');

    this.storage.get('unconformities').then(unconformities => {
      this.types = unconformities.types;
      this.problems = unconformities.problems;
    });
  }


  save(form: NgForm) {
    let formData = form.control.getRawValue();
    formData.pictures = this.pictures;
    console.log(formData);

    this.storage.get('service_order').then(os => {
      if (!os.unconformities) {
        os.unconformities = [];
      }

      os.unconformities.push(formData);


      this.storage.set('service_order', os).then(data => {

        this.translate.get(['os_noncompliance.no_conformity_success_register', 'attention']).subscribe(res => {
          let alert = this.alertCtrl.create({
            title: res.attention,
            message: res['os_noncompliance.no_conformity_success_register'],
            enableBackdropDismiss: false
          });

          alert.addButton({
            text: 'OK',
            handler: data => {

              this.navCtrl.pop();
            }
          });
          alert.present();
        })
      });

    });




  }

}
