import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Events } from 'ionic-angular';
import { OrderService } from '../../services/order-service';
import { In } from '../../models/in';
import { ConfigService } from '../../services/config';
import { LocationTracker } from '../../providers/location-tracker';
import { StorageService } from '../../services/storage-service';
import { Order } from '../../models/order';
import { HelperService } from '../../services/helper-service';
import { ActiveOrderPage } from '../active-order/active-order';
import { Diagnostic } from '@ionic-native/diagnostic';


@IonicPage()
@Component({
  selector: 'page-waiting-order',
  templateUrl: 'waiting-order.html',
})
export class WaitingOrderPage {

  currentPoints: Array<In>;
  currentPoint: In;
  pointQty: number;
  currentP: number = 0;
  indx: number;
  title: string = "Выехал";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              private configService: ConfigService,
              private locationTracker: LocationTracker,
              private helperService: HelperService,
              private alertCtrl: AlertController,
              private storageService: StorageService,
              private diagnostic: Diagnostic,
              public events: Events,
              private orderService: OrderService) {

        this.currentPoints = this.orderService.selectedOrder.inItems;
          
        for(let i=0; i<this.currentPoints.length; i++){
          if(this.currentPoints[i].state == 0 || this.currentPoints[i].state == 1){
            this.indx = i;
            this.currentPoint = this.currentPoints[i];
            this.currentPoint.loadingUnloadingType = this.currentPoint.loadingUnloadingType.toLowerCase();
            this.orderService.activePoint = this.currentPoint;
            break;
          }
        }

        if(this.currentPoints.length == 1  || this.indx == this.currentPoints.length - 1){
          this.title = "Выехал на маршрут";
        }
        console.log("Current Order", this.orderService.selectedOrder);


  }

  ionViewDidEnter(){
      this.events.subscribe('success:waitingCame', () => {
        this.sendReq('');
      });
  }

  ionViewDidLeave(){
    this.events.unsubscribe('success:waitingCame');
  }


  iCame(){  // прибыл
    this.locationTracker.testCheckGps(false, true);
  }

  sendReq(comment: string){
    if(this.helperService.isNetworkConnected){
      const loader = this.loadingCtrl.create();
      loader.present();
      this.orderService.changeOrderState(this.orderService.selectedOrder.id, this.configService.orderStates.stCameLoad, comment).then((res: any)=>{
        loader.dismiss();
        if(res !== undefined){
          this.cameResponse();
        }
      },(error: any)=>{
        loader.dismiss();
      })
    }else{
      this.helperService.driversOfflineData(this.orderService.selectedOrder.id,
                                            this.orderService.nextPoint.lat,
                                            this.orderService.nextPoint.lng,
                                            this.configService.orderStates.stCameLoad);
      this.cameResponse();
    }
  }

  cameResponse(){
      this.orderService.selectedOrder.inItems[this.indx].state = 1;
      this.orderService.selectedOrder.status = 3;
      this.orderService.waitingOrders[this.orderService.selectedOrderIndx].status = 3;
      
      this.currentPoint.state = 1;
      this.orderService.isUserOnPoint = false;

      this.helperService.changeStorageOrderState('waitingOrders',
                                                  this.orderService.selectedOrderIndx,
                                                  this.orderService.selectedOrder.id,
                                                  this.orderService.selectedOrder.status,
                                                  'inItems',
                                                  this.indx,
                                                  1);

      console.log(this.indx);
      if(this.indx+1 !== this.orderService.selectedOrder.inItems.length){
        this.orderService.nextPoint =  this.orderService.selectedOrder.inItems[this.indx+1];
        console.log("Not Predposledniy", this.orderService.nextPoint);
      }else{
        this.orderService.nextPoint =  this.orderService.selectedOrder.outItems[0];
        console.log("Next Point Changed", this.orderService.nextPoint);
      }
  }

  
  imGoing(){  // выехал
    if(this.helperService.isNetworkConnected){
      const loader = this.loadingCtrl.create();
      loader.present();
  
      this.orderService.changeOrderState(this.orderService.selectedOrder.id, this.configService.orderStates.stGoLoad, '').then((res: any) => {
        loader.dismiss();
        if(res !== undefined){
          this.goResponse();
        }
      },(error:any)=>{
        loader.dismiss();
      })

    }else{
      if(this.title == "Выехал на маршрут" && this.orderService.activeOrders.length > 0){
        this.configService.presentToast("У вас имеется не завершенная заявка.", "error", "middle", false, "", 3000);
      }else{
        this.helperService.driversOfflineData(this.orderService.selectedOrder.id,
                                              this.orderService.nextPoint.lat,
                                              this.orderService.nextPoint.lng,
                                              this.configService.orderStates.stGoLoad);
        this.goResponse();
      }
    }    
  }
  

  goResponse(){
    if(this.indx !== this.currentPoints.length - 1){
          this.currentPoint.state = 2;
          this.orderService.selectedOrder.inItems[this.indx].state = 2;

          this.orderService.selectedOrder.status = 2;
          this.orderService.waitingOrders[this.orderService.selectedOrderIndx].status = 2;

          this.helperService.changeStorageOrderState('waitingOrders',
                                                     this.orderService.selectedOrderIndx,
                                                     this.orderService.selectedOrder.id,
                                                     this.orderService.selectedOrder.status,
                                                     'inItems',
                                                     this.indx,
                                                     2);

          this.currentPoint = this.currentPoints[this.indx + 1];
          console.log(this.currentPoint);
          this.indx = this.indx + 1
          if(this.indx == this.currentPoints.length - 1){
            this.title = "Выехал на маршрут";
          }else{
            this.orderService.activePoint = this.currentPoint;
            this.title = "Выехал";
          }
        
    } else {
        this.navCtrl.setRoot(ActiveOrderPage);

        this.currentPoint.state = 2;
        this.orderService.selectedOrder.inItems[this.indx].state = 2;

        var from = { inx: this.orderService.selectedOrderIndx, nameArr: "waitingOrders", countName: "waitingOrdersQty" };
        var to = { nameArr: "activeOrders", item: this.orderService.selectedOrder, countName: "activeOrdersQty" };
        this.orderService.moveFromTo(from, to);
        
        let order= this.orderService.selectedOrder;
        order.status = 4;
        order.inItems[this.indx].state = 2;
        let orders: Array<Order> = [];
        orders[0] = order;
        this.storageService.storeData('activeOrders', orders);
        this.storageService.removeObject('waitingOrders', this.orderService.selectedOrderIndx);

        this.orderService.selectedOrder = null;
        this.orderService.selectedOrderIndx = null;
        
    }
  }

}
