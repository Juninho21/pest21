import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { NgForm } from '@angular/forms';

/**
 * Generated class for the PestModalSelectorComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pest-modal-selector',
  templateUrl: 'pest-modal-selector.html'
})
export class PestModalSelectorComponent {

  text: string;
  model: any = [
    {
      name: "Mosca Doméstica",
      dead: "",
      live: ""
    },
    {
      name: "Mosquito",
      dead: "",
      live: ""
    },
    {
      name: "Vespa",
      dead: "",
      live: ""
    }
  ];

  type: string = 'normal';
  plagues: any = [];
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    console.log('Hello PestModalSelectorComponent Component');
    this.text = 'Hello World';

    this.type = this.navParams.get('type') ? this.navParams.get('type') : 'normal';

    this.plagues = this.navParams.get('plagues');

    if (this.type == 'normal') {
      this.plagues.forEach(plague => {
        plague.dead = "";
        plague.live = "";
      });
    } else {
      this.plagues.forEach(plague => {
        plague.count = "";
      });
    }

    console.log(this.plagues);
  }

  closeModal(form: NgForm) {
    console.log(this.model);

    let data = [];

    this.plagues.forEach(plague => {
      if (this.type == 'normal') {
        if (plague.dead > 0 || plague.live > 0) {
          data.push(plague);
        }
      }else {
        if (plague.count && plague.count > 0){
          data.push(plague);
        }
      }
    });
    this.viewCtrl.dismiss(data);
  }

}
