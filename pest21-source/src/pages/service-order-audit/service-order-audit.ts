import { Component, ViewChild  } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ActionSheetController, ToastController, Platform  } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Diagnostic } from '@ionic-native/diagnostic';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { PhotoViewer } from '@ionic-native/photo-viewer';

/**
 * Generated class for the ServiceOrderAuditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-audit',
  templateUrl: 'service-order-audit.html',
})
export class ServiceOrderAuditPage {

  @ViewChild('textarea') textarea: any;
  @ViewChild('galleryInput') galleryInput: any;
  scheduling: any = {};
  auditGroups: any[] = [];
  responses: any[] = [];
  services: any = [];
  contracts: any = [];
  pictures: any = [];
  pendingGalleryQuestionId: number = null;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public storage: Storage,
    private alertCtrl: AlertController,
    public translate: TranslateService,
    public actionSheetCtrl: ActionSheetController,
    public camera: Camera,
    public photoViewer: PhotoViewer,
    public toastCtrl: ToastController,
    private diagnostic: Diagnostic,
    private openNativeSettings: OpenNativeSettings,
    public platform: Platform
  ) 
  {
    if (this.navParams.get('scheduling')) {
      this.scheduling = this.navParams.get('scheduling');
    }

    this.responses = [];

  }

  ionViewDidLoad() {
  }

  
  ionViewDidEnter() {

    this.storage.get('clients').then(contracts => {
      this.contracts = contracts;

      this.storage.get('service_order').then(os => {
     
        this.scheduling = os.data;
        //console.log("Scheduling:");
        //console.log(this.scheduling);
        /*this.services = os;
        if(os.audits)
          this.responses = os.audits;
  
        this.scheduling.contract = this.contracts.find(contract => contract.id == this.scheduling.contract_id);
        */
        if (this.scheduling.schedule_contract.client.chain.audit != null){
          this.auditGroups = this.scheduling.schedule_contract.client.chain.audit.audit_groups;

          // Cria numeração das perguntas
          this.auditGroups.forEach((auditQuestions, groupIndex) => {
            auditQuestions.audit_questions.forEach((question, questionIndex) => {
              question['counter'] = questionIndex + 1;
            });
          });

        } else {
          console.log("Não existem questões cadastradas");
          this.navCtrl.pop();
        }
  
      }).catch(err => {
        console.log(err);
      })
      
    }).catch(err => {
      console.log(err);
    })

    

    this.adjustTextareaHeight();

  }

  findQuestionById(questionId: number): any {
    for (let audit of this.auditGroups) {
      for (let question of audit.audit_questions) {
        if (question.id === questionId) {
          return question;
        }
      }
    }
    return null;
  }

  selectAnswer(questionId: number, answer: boolean) {
    //console.log("Execute selectAnswer");
    const existingResponseIndex = this.responses.findIndex(response => response.question_id === questionId);
    //console.log(questionId +" ->"+ existingResponseIndex);
    const observation = answer ? '' : null;

    if (existingResponseIndex !== -1) {
      this.responses[existingResponseIndex] = { question_id: questionId, answer, observation };
    } else {
      this.responses.push({ question_id: questionId, answer, observation });
    }

    if (!answer) {
      this.updateObservation(questionId, null);
    }
  }

  isChecked(questionId: number, answer: boolean): boolean {
    const response = this.responses.find(response => response.question_id === questionId);
    return response ? response.answer === answer : false;
  }

  getObservation(questionId: number): string {
    const response = this.responses.find(response => response.question_id === questionId);
    return response ? response.observation : '';
  }

  updateObservation(questionId: number, observation: string) {
    const responseIndex = this.responses.findIndex(response => response.question_id === questionId);
    if (responseIndex !== -1) {
      this.responses[responseIndex].observation = observation;
    } else {
      this.responses.push({ question_id: questionId, answer: null, observation });
    }
  }

  areAllQuestionsAnswered(): string[] {

    const errorMessages: string[] = [];

    for (let audit of this.auditGroups) {
      for (let question of audit.audit_questions) {

        if (question.required) {

          const response = this.responses.find(response => response.question_id === question.id);
      
          if (question.required && response === undefined) {
            this.translate.get('os_audit.validate_messages.required', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
              errorMessages.push(translatedMessage);
            });
            return errorMessages;
          } 
          if (question.type === 'BOOLEAN') {
            if (response.answer === true && question.open_observation_true && question.required_observation && (!response.observation || response.observation.trim() === '')) {
              this.translate.get('os_audit.validate_messages.open_observation_true', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                errorMessages.push(translatedMessage);
              });
              return errorMessages;
            }
            if (response.answer === false && question.open_observation_false && question.required_observation && (!response.observation || response.observation.trim() === '')) {
              this.translate.get('os_audit.validate_messages.open_observation_false', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                errorMessages.push(translatedMessage);
              });
              return errorMessages;
            }
            if (response.answer === true && question.open_img_true && question.required_img && (!response.img || response.img.trim() === '')) {
              this.translate.get('os_audit.validate_messages.open_img_true', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                errorMessages.push(translatedMessage);
              });
              return errorMessages;
            }
            if (response.answer === false && question.open_img_false && question.required_img && (!response.img || response.img.trim() === '')) {
              this.translate.get('os_audit.validate_messages.open_img_false', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                errorMessages.push(translatedMessage);
              });
              return errorMessages;
            }
          }
          if (question.type === 'TEXT' && question.required_img && (!response.img || response.img.trim() === '')) {
            this.translate.get('os_audit.validate_messages.required_img', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
              errorMessages.push(translatedMessage);
            });
            return errorMessages;
          }
          
        }

        for (let son of question.question_son) {

          console.log("id pergunta: "+son.id);
          if (son.required) {
            console.log("é obrigatória? "+son.required);
            const response = this.responses.find(response => response.question_id === son.id);
            
            if (son.required && response === undefined) {
              this.translate.get('os_audit.validate_messages.required', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                errorMessages.push(translatedMessage);
              });
              return errorMessages;
            } 
            if (son.type === 'BOOLEAN') {
              console.log("Entrou no boolean");
              if (response.answer === true && son.open_observation_true && son.required_observation && (!response.observation || response.observation.trim() === '')) {
                this.translate.get('os_audit.validate_messages.open_observation_true', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                  errorMessages.push(translatedMessage);
                });
                return errorMessages;
              }
              if (response.answer === false && son.open_observation_false && son.required_observation && (!response.observation || response.observation.trim() === '')) {
                this.translate.get('os_audit.validate_messages.open_observation_false', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                  errorMessages.push(translatedMessage);
                });
                return errorMessages;
              }
              if (response.answer === true && son.open_img_true && son.required_img && (!response.img || response.img.trim() === '')) {
                this.translate.get('os_audit.validate_messages.open_img_true', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                  errorMessages.push(translatedMessage);
                });
                return errorMessages;
              }
              if (response.answer === false && son.open_img_false && son.required_img && (!response.img || response.img.trim() === '')) {
                this.translate.get('os_audit.validate_messages.open_img_false', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                  errorMessages.push(translatedMessage);
                });
                return errorMessages;
              }
            }
            if (son.type === 'TEXT' && son.required_img && (!response.img || response.img.trim() === '')) {
              console.log("Entrou no text");
              this.translate.get('os_audit.validate_messages.required_img', { group: audit.name ,counter: question.counter }).subscribe((translatedMessage: string) => {
                errorMessages.push(translatedMessage);
              });
              return errorMessages;
            }
            
          }
          
        }
        
      }
    }

    return errorMessages;
  }

  saveResponses() {

    const errors = this.areAllQuestionsAnswered();

    if (errors.length > 0) {

      const toast = this.toastCtrl.create({
        message: errors[0],
        duration: 5000,
        position: 'top',
        cssClass: 'toast-error'
      });
     toast.present();
     return;
    }

    const jsonResponses = this.responses
                          .filter(response => response.question_id !== null && response.question_id !== undefined)
                          .map(response => ({
                            question_id: response.question_id,
                            answer: response.answer,
                            observation: response.observation ? response.observation : null,
                            img: response.img ? response.img : null
                          }));

    console.log("Respostas enviadas....");
    console.log(jsonResponses);

    this.storage.get('service_order').then(os => {
      os.audits = [];

      os.audits = jsonResponses;

      this.storage.set('service_order', os).then(data => {

        this.translate.get(['os_audit.success', 'attention']).subscribe(res => {


          let alert = this.alertCtrl.create({
            title: res.attention,
            message: res['os_audit.success'],
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

  resetAudit() {
    this.storage.get('service_order').then(os => {
      os.audits = [];
      
      this.storage.set('service_order', os).then(data => {
        this.ionViewDidEnter();
      })

    })
  }

  getPlaceholderText(requiredObservation: boolean): string {
    const baseText = this.translate.instant('os_audit.observation');
    const baseTextRequired = this.translate.instant('required');
    return requiredObservation ? `${baseText} ${baseTextRequired} *` : baseText;
  }

  getPhotoRequired(required: boolean): string {
    const baseText = this.translate.instant('os_audit.picture');
    const baseTextRequired = this.translate.instant('required');
    const baseAdd = this.translate.instant('os_audit.add_picture');
    return required ? `${baseText} ${baseTextRequired} *` : baseAdd ;
  }

  getPlaceholderDescribe(required: boolean): string {
    const baseText = this.translate.instant('describe');
    return required ? `${baseText} *` : baseText;
  }

  addPicture(question) {
    this.presentActionSheet(question);
  }
  
  presentActionSheet(question) {
    this.translate.get(['os_noncompliance.add_pictures', 'camera', 'gallery', 'cancel']).subscribe(res => {
      const actionSheet = this.actionSheetCtrl.create({
        title: res['os_noncompliance.add_pictures'],
        buttons: [
          {
            text: res['camera'],
            handler: () => {
              console.log('Camera clicked');
              this.openCamera(question);
            }
          },
          {
            text: res['gallery'],
            handler: () => {
              console.log('Gallery clicked');
              this.openGalleryPicker(question);
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

  async openCamera(question: number) {
    if (!this.platform.is('cordova')) {
      return;
    }

    try {
      const permission = this.diagnostic.permission.CAMERA;
      const status = await this.diagnostic.getPermissionAuthorizationStatus(permission);

      if (status === this.diagnostic.permissionStatus.GRANTED) {
        this.takePicture(this.camera.PictureSourceType.CAMERA, question);
        return;
      }

      const requestStatus = await this.diagnostic.requestRuntimePermission(permission);
      if (requestStatus === this.diagnostic.permissionStatus.GRANTED) {
        this.takePicture(this.camera.PictureSourceType.CAMERA, question);
        return;
      }

      this.alertCameraPermission();
    } catch (err) {
      console.log('Erro ao solicitar permissão da câmera:', err);
      this.alertCameraPermission();
    }
  }

  openGalleryPicker(question: number) {
    this.pendingGalleryQuestionId = question;

    if (this.galleryInput && this.galleryInput.nativeElement) {
      this.galleryInput.nativeElement.value = '';
      this.galleryInput.nativeElement.click();
    }
  }

  async onGallerySelected(event: any) {
    const file = event && event.target && event.target.files && event.target.files[0];

    if (!file || this.pendingGalleryQuestionId === null) {
      this.pendingGalleryQuestionId = null;
      return;
    }

    try {
      const fileDataUrl = await this.readFileAsDataUrl(file);
      const base64Image = await this.normalizeDataUrlToJpeg(fileDataUrl);
      this.setPictureForQuestion(this.pendingGalleryQuestionId, base64Image);
      this.pendingGalleryQuestionId = null;
    } catch (err) {
      console.log('Erro ao processar imagem da galeria:', err);
      this.pendingGalleryQuestionId = null;
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

  setPictureForQuestion(question: number, base64Image: string) {
    const responseIndex = this.responses.findIndex(response => response.question_id === question);

    if (responseIndex !== -1) {
      this.responses[responseIndex].img = base64Image;
    } else {
      this.responses.push({
        question_id: question,
        answer: null,
        observation: null,
        img: base64Image
      });
    }
  }
  
  takePicture(fromType: number, question) {
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
    };
  
    this.camera.getPicture(options).then(async (imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;

      if (fromType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        base64Image = await this.normalizeDataUrlToJpeg(base64Image);
      }

      this.setPictureForQuestion(question, base64Image);
    }, (err) => {
      console.log(err); // Handle error
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

  deletePicture(questionId: number) {
    const responseIndex = this.responses.findIndex(response => response.question_id === questionId);
    if (responseIndex !== -1) {
      this.responses[responseIndex].img = null;
    }
  }

  openPicture(url) {
    this.translate.get('os_noncompliance.no_conformity').subscribe(res => {
      this.photoViewer.show(url, res, { share: false });
    })

  }

  getImg(questionId: number): string[] {
    const response = this.responses.find(response => response.question_id === questionId);
    return response && response.img ? [response.img] : [];
  }

  adjustTextareaHeight(): void {
    /*const textArea = this.textarea._elementRef.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';*/
  }

}
