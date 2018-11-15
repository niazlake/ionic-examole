import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OrderService } from '../../services/order-service';

@IonicPage()
@Component({
  selector: 'page-closed-orders',
  templateUrl: 'closed-orders.html',
})
export class ClosedOrdersPage {

  constructor(public navCtrl: NavController,
              private orderService: OrderService,
              public navParams: NavParams) {
  }

  doRefresh(refresher){
    this.orderService.getClosedOrders(false).then((res: any)=>{
      refresher.complete();
      this.orderService.historyOrders = res.data.items;
      console.log(this.orderService.historyOrders);
    },(error)=>{
      refresher.complete();
    });
  }

}
