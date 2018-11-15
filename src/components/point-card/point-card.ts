import { Component } from '@angular/core';

/**
 * Generated class for the PointCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'point-card',
  templateUrl: 'point-card.html'
})
export class PointCardComponent {

  text: string;

  constructor() {
    console.log('Hello PointCardComponent Component');
    this.text = 'Hello World';
  }

}
