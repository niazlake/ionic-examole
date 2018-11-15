import { Component, Input } from '@angular/core';
import { Order } from '../../models/order';

@Component({
  selector: 'order-card',
  templateUrl: 'order-card.html'
})
export class OrderCardComponent {

  @Input('order') orderObj;
  order: Order;

  constructor() {
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.order = this.orderObj;
    },);
  }

  

}
