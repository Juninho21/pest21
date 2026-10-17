import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, AlertOptions, MenuController, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { HomePage } from '../home/home';

/**
 * Generated class for the ServiceOrderEvaluationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-order-evaluation',
  templateUrl: 'service-order-evaluation.html',
})
export class ServiceOrderEvaluationPage {
  evaluationOne: any;
  evaluationTwo: any;
  reason_one: any;
  reason_two: any;

  comment_one: any;
  comment_two: any;

  subreason_one: any;
  subreason_two: any;
  selectOptions: AlertOptions = {
    cssClass: "custom-evaluation"
  }
  reasons: any = {

    "Comportamento": [
      'Dificuldade de Comunicação',
      'Falta de Proatividade',
      'Postura Inapropriada'
    ],
    "Descumprimento da Agenda": [
      'Data da Visita Não Atende a Necessidade do Cliente',
      'Não Segue o Cronograma',
      'Não Vai no Horário Agendado'
    ],
    "Insatisfação Técnica": [
      "Descumprimento de Protocolo",
      "Despreparo Técnico",
      "Utilização de Produtos Indevidos"
    ],
    "Não Atendimento dos Requisitos de Segurança": [
      "Apresentação (Uniforme, Barba, Etc.)",
      "Descumprimento de Protocolos Internos de Segurança",
      "Técnico Sem EPI"
    ]
  }

  reasonsTwo: any = {
    "Administrativo": [
      "2ª Via - Boletos",
      "2ª Via - Notas Fiscais",
      "Cancelamento De Notas Fiscais",
      "Contratos",
      "Ordens De Compras/P. O.",
      "Reajustes",
    ],
    "Departamento De Crédito e Cobrança": [
      "Cobranças",
      "Impostos",
    ],
    "Documentação": [
      "Documentos Legais (Licenças/Certidões/Alvarás)",
      "Documentos De Funcionários",
      "Documentos SHE",
      "Website De Clientes",
    ],
    "Portal Pest XXI": [
      "Certificados De Veículos",
      "Divergências Em Dados Gerais",
      "Login e Senha",
      "Ordem De Serviço/Comprovante De Execução De Serviço",
      "Relatório Estatístico",
    ],
    "Presença de Pragas": [
      "Aranhas",
      "Baratas",
      "Cupins",
      "Escorpiões",
      "Formigas",
      "Moscas",
      "Mosquitos",
      "Outros",
      "Roedores",
    ]


  }

  reasonsKeys: any = [];
  reasonsTwoKeys: any = [];
  currentLang: any;
  constructor(
    public menu: MenuController,
    public storage: Storage,
    public api: ApiProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public translate: TranslateService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ServiceOrderEvaluationPage');
    this.menu.enable(false);

    this.currentLang = this.translate.currentLang;

    this.translate.get(['os_evaluation.title', 'os_evaluation.initial_warning', 'confirm', 'cancel']).subscribe(trans => {

      this.reasonsKeys = Object.keys(this.reasons);
      this.reasonsTwoKeys = Object.keys(this.reasonsTwo);
      this.alertCtrl.create({
        title: trans['os_evaluation.title'],
        message: `${trans['os_evaluation.initial_warning']}`,
        enableBackdropDismiss: false,
        buttons: [{
          text: trans.cancel,
          role: 'cancel',
          handler: data => {
            this.navCtrl.pop();
          }
        },
        {
          text: trans.confirm,
          handler: data => {

          }
        }
        ], cssClass: 'evaluation-alert'
      }).present();

    });
  }

  adjustTextarea(event: any): void {
    /*let textarea: any = event.target;
    textarea.rows = textarea.value.split('\n').length;*/
    return;
  }

  save() {

    let evaluation = {
      evaluation_one: this.evaluationOne,
      evaluation_two: this.evaluationTwo,
      reason_one: this.reason_one,
      reason_two: this.reason_two,
      subreason_one: this.subreason_one,
      subreason_two: this.subreason_two,
      comment_one: this.comment_one,
      comment_two: this.comment_two
    };

    this.storage.get('service_order').then(os => {

      os.evaluation = evaluation;

      this.storage.set('service_order', os).then(data => {

        this.translate.get(['attention', 'os_evaluation.save_evaluation']).subscribe(trans => {
          let alert = this.alertCtrl.create({
            enableBackdropDismiss: false
          });

          alert.setTitle(trans.attention);
          alert.setMessage(trans['os_evaluation.save_evaluation'])
          alert.addButton({
            text: 'OK',
            handler: data => {

              /*let pages = [{
                page: ServiceOrderPage,
                params: null
              },
              {
                page: ServiceOrderFinishPage,
                params: null
              }
              ]
              this.navCtrl.setPages(pages, { animate: true, direction: 'forward' });*/

              this.laterSave(os);

            }
          });
          alert.present();
        });
      });
    });
  }

  laterSave(os) {


    this.translate.get(['attention', 'os_evaluation.later_save']).subscribe(trans => {
      let alert = this.alertCtrl.create({
        enableBackdropDismiss: false,

      });

      alert.setTitle(trans.attention);
      alert.setMessage(trans['os_evaluation.later_save'])
      alert.addButton({
        text: 'OK',
        handler: data => {
          this.storage.get('os_pool_' + this.api.currentUser.id).then(pool => {
            let cPool
            if (!pool) {
              cPool = [];
            } else {
              cPool = pool;
            }

            os.saved = false;
            cPool.push(os);

            this.storage.set('os_pool_' + this.api.currentUser.id, cPool).then(() => {
              this.storage.remove("service_order").then(() => {
                this.navCtrl.setRoot(HomePage, { animate: true, direction: 'back' });
              });
            });
          });
        }
      });

      this.navCtrl.setRoot(HomePage, { animate: true, direction: 'back' }).then(() => {
        alert.present();
      });

    });
  }

}
