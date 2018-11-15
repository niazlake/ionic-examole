import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { SettingsProvider } from '../../providers/settings';
import { OrderInfoTab } from '../orderInfoTab';
import { OrderService } from '../../services/order-service';
import { Order } from '../../models/order';
import { LocationTracker } from '../../providers/location-tracker';
import { StorageService } from '../../services/storage-service';


@Component({
  selector: 'page-new-orders',
  templateUrl: 'new-orders.html',
})
export class NewOrdersPage {

  selectedTheme: String;
  isLoading: boolean = false;

  offData: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public app: App,
              public locationTracker: LocationTracker,
              private orderService: OrderService,
              private storageService: StorageService,
              private settings: SettingsProvider) {

      this.settings.getActiveTheme().subscribe(val => {
        this.selectedTheme = val;
      });
      
  }

  toggleAppTheme() {
      if (this.selectedTheme === 'dark-theme') {
        this.settings.setActiveTheme('light-theme');
      } else {
        this.settings.setActiveTheme('dark-theme');
      }
  }

  doRefresh(refresher){
    this.orderService.getNewOrders(false).then((res: any)=>{
      refresher.complete();
      if(res !== undefined){
        this.orderService.newOrders = res.data.items;
        console.log(this.orderService.newOrders);
      }
    },error=>{
      refresher.complete();
    });
  }

  onSelectOrder(order: Order, indx: number){
      this.orderService.selectedOrder = order;
      this.orderService.selectedOrderIndx = indx;
      this.app.getRootNav().push(OrderInfoTab);  
    
  }

  getOfflineData(key: string){
    this.storageService.getDataByKey(key).then((result) => {
      this.offData = JSON.parse(result);
    });
  }

  clearOffData(key: string){
    this.storageService.removeItem(key);
  }


}
