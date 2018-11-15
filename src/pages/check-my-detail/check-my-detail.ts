import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { OrderService } from '../../services/order-service';
import { UserData } from '../../models/userData';
import { ConfigService } from '../../services/config';
import { LocationTracker } from '../../providers/location-tracker';
import { StorageService } from '../../services/storage-service';
import { NewOrdersPage } from '../new-orders/new-orders';

@IonicPage()
@Component({
  selector: 'page-check-my-detail',
  templateUrl: 'check-my-detail.html',
})
export class CheckMyDetailPage {

  userData: UserData;
  orderId: number;


  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              private configS: ConfigService,
              public locationTracker: LocationTracker,
              private configService: ConfigService,
              private storageService: StorageService,
              private orderService: OrderService) {
       
        this.userData = this.navParams.get("userData");
        
  };



  onAcceptOrder(){
    if(!this.orderService.isNetworkConnected){
      this.configService.presentToast("Нет соединение с интернетом!", "error", "middle", false, "", 4000);
    }else{
      const loader = this.loadingCtrl.create();
      loader.present();

        this.orderService.changeOrderState(this.userData["orderId"], this.configS.orderStates.stAccept,'').then((res: any) => {
            loader.dismiss();
            if(res !== undefined){          
              this.orderService.activePoint = this.orderService.selectedOrder.inItems[0];
              this.orderService.nextPoint = this.orderService.selectedOrder.inItems[0];

              this.locationTracker.startTracking();
              
              var from = { inx: this.orderService.selectedOrderIndx, nameArr: "newOrders", countName: "newOrdersQty" };
              var to = { nameArr: "waitingOrders", item: this.orderService.selectedOrder, countName: "waitingOrdersQty" };
              this.orderService.moveFromTo(from, to);

              this.navCtrl.setRoot('WaitingOrdersPage');
              
              this.storageService.getDataByKey('waitingOrders').then((result)=>{
                let orders = JSON.parse(result);
                orders.push(this.orderService.selectedOrder);
                this.storageService.removeItem('waitingOrders');
                this.storageService.storeData('waitingOrders', orders);
                this.orderService.selectedOrder = null;
                this.orderService.selectedOrderIndx = null;
              })

              this.orderService.setNewOrdersToStrorage();
            }
        }, (error: any) => {
            loader.dismiss();
        })
      }  
  }


  onErrorUserdata(){
      let prompt = this.alertCtrl.create({
        title: "Сообщить об ошибке",
        cssClass: 'errorPrompt',
        inputs: [
          {
            type: 'textarea',
            name: 'text',
            placeholder: 'Ошибка...'
          },
        ],
        buttons: [
          {
            text: 'Отмена',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Отправить',
            handler: data => {
              console.log('Saved clicked', data);
              this.sendErrorUserData(this.userData["orderId"], data.text);
            }
          }
        ]
      });
      if(this.orderService.isNetworkConnected){
        prompt.present();
      }else{
        this.configS.presentToast("Сообщение невозможно отправить. Включите мобильный интернет", "error", "middle", false, "", 3000);
      }
  }


  sendErrorUserData(id: number, text: string){
    this.orderService.onErrorUserdata(id,text).then((res: any) => {
      if(res !== undefined){
        this.configS.presentToast(res.message, "success", "top", false, "", 2000);
        this.orderService.newOrders[this.orderService.selectedOrderIndx].textError = res.textError;
        this.navCtrl.setRoot(NewOrdersPage);
      }
    }, (error: any) => {
      console.log(error);
    })
  }

}
