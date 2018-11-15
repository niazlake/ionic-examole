import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OrderService } from '../../services/order-service';
import { Order } from '../../models/order';
import { LocationTracker } from '../../providers/location-tracker';
import { WaitingOrderPage } from '../waiting-order/waiting-order';


@IonicPage()
@Component({
  selector: 'page-waiting-orders',
  templateUrl: 'waiting-orders.html',
})
export class WaitingOrdersPage {

  waitingOrders: Array<Order>;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private locationTracker: LocationTracker,
              private orderService: OrderService) {
     
      this.waitingOrders = this.orderService.waitingOrders;
      console.log(this.orderService.waitingOrders);
      if(this.waitingOrders.length > 0){
        console.log(this.waitingOrders[0].inItems);
       }
  }


  doRefresh(refresher){
    this.orderService.getWaitingOrders(false).then((res: any)=>{
      refresher.complete();
      this.orderService.waitingOrders = res.data.items;
      this.waitingOrders = res.data.items;
      console.log(this.waitingOrders);
    },error=>{
      refresher.complete();
    })
  }


  onSelectOrder(order: Order, indx: number){
    this.orderService.selectedOrder = order;
    this.orderService.selectedOrderIndx = indx;
    for(let i=0; i<this.orderService.selectedOrder.inItems.length; i++){
      if(this.orderService.selectedOrder.inItems[i].state == 0 || this.orderService.selectedOrder.inItems[i].state == 1){
        this.orderService.nextPoint = this.orderService.selectedOrder.inItems[i];
        this.locationTracker.calculateUserDistance();
        break;
      }
    }

    this.navCtrl.push(WaitingOrderPage);
  }



}
