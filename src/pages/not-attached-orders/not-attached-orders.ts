import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OrderService } from '../../services/order-service';
import { Order } from '../../models/order';
import { NotAttachedOrdDetailPage } from '../not-attached-ord-detail/not-attached-ord-detail';

@IonicPage()
@Component({
  selector: 'page-not-attached-orders',
  templateUrl: 'not-attached-orders.html',
})
export class NotAttachedOrdersPage {

  notAttachedOrders: Array<Order>;
  

  constructor(public navCtrl: NavController,
              private orderService: OrderService,
              public navParams: NavParams) {
      
      this.notAttachedOrders = this.orderService.notAttachedOrders;

  }


  doRefresh(refresher){
    this.orderService.getNotAttachedOrders(false).then((res: any)=>{
      refresher.complete();
      this.orderService.notAttachedOrders = res.data.items;
      this.notAttachedOrders = this.orderService.notAttachedOrders;
      this.orderService.notAttachedOrdersQty = this.orderService.notAttachedOrders.length;
    },(error)=>{
      refresher.complete();
    })
  }
  

  onSelectOrder(order: Order, indx: number){
    console.log(order, indx);
    this.orderService.selectedOrder = order;
    this.orderService.selectedOrderIndx = indx;
    this.navCtrl.push(NotAttachedOrdDetailPage);
  }

  
}
