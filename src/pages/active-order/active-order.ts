import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController, AlertController, Events } from 'ionic-angular';
import { OrderService } from '../../services/order-service';
import { In } from '../../models/in';
import { CallNumber } from '@ionic-native/call-number';
import { ConfigService } from '../../services/config';
import { ActionSheet } from 'ionic-angular/components/action-sheet/action-sheet';
import { LocationTracker } from '../../providers/location-tracker';
import { Order } from '../../models/order';
import { StorageService } from '../../services/storage-service';
import { HelperService } from '../../services/helper-service';
import { DocumentsPage } from '../documents/documents';
import { Diagnostic } from '@ionic-native/diagnostic';

@IonicPage()
@Component({
  selector: 'page-active-order',
  templateUrl: 'active-order.html',
})
export class ActiveOrderPage {

  currentPoints: Array<In>;
  currentPoint: In;
  pointQty: number;
  currentP: number = 0;
  
  actionSheet: ActionSheet;
  
  withAcception: boolean = false;
  withoutAcception: boolean = false;
  waitText: string = "Задержка";
  isWaiting: boolean = false;
  indx: number;
  title: string = "Выехал";
  
  isThereItem: boolean = false;
  activeOrder: Order;
  isDuplicate: boolean = false;
  isLastPoint: boolean = false;

  // docupentWithAcception: boolean = false;

  documentAcception: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              private configService: ConfigService,
              private callNumber: CallNumber,
              public locationTracker: LocationTracker,
              private helperService: HelperService,
              private storageService: StorageService,
              private alertCtrl: AlertController,
              public events: Events,
              private diagnostic: Diagnostic,              
              private orderService: OrderService) {
       
        this.events.subscribe('success:activeCame', (data: any) => {
          console.log('COMMENT', data);
          if(data !== '' && data !== undefined){
            if(this.helperService.isNetworkConnected) {
              this.sendReq(data);
            }else{
              this.configService.presentToast("Нет соединение с интернетом!", "error", "middle", false, "", 4000);
            }
          }else{
            this.sendReq(data);
          }
        });
        
        // Checking active point and SET needed point
        if(this.orderService.activeOrders.length > 0){
          this.isThereItem = true;
          console.log(this.orderService.activeOrders);
          this.defineActivePoint();
          this.photoPuter();
        }else if(!this.helperService.isNetworkConnected && this.orderService.activeOrders.length == 0){
          this.isThereItem = false;
          
          this.storageService.getDataByKey('activeOrders').then((result)=>{
            if(result && result !== null){
              this.orderService.activeOrders = JSON.parse(result);
              this.defineActivePoint();
              this.photoPuter();
            }
          })
        }
       
  }


  async defineActivePoint(){
    this.currentPoints = this.orderService.activeOrders[0].outItems;
    this.activeOrder = this.orderService.activeOrders[0];
    console.log(this.activeOrder);
    for(let i=0; i<this.currentPoints.length; i++){
      if(this.currentPoints[i].state == 0 || this.currentPoints[i].state == 1){
        
        this.isLastPoint = false;
        this.indx = i;
        this.currentPoint = this.currentPoints[i];
        if(this.currentPoint.damage == 1){
          this.documentAcception = 'bad';
        }else if(this.currentPoint.damage == 0){
          this.documentAcception = 'good';
        }

        this.orderService.activePoint = this.currentPoint;
        this.orderService.nextPoint = this.currentPoint;
        await this.locationTracker.calculateUserDistance();
        break;
      }else if(i == this.currentPoints.length-1 && this.currentPoints[i].state == 2){
        console.log("HERE WE ARE");
        this.currentPoint = this.orderService.activeOrders[0].outItems[this.orderService.activeOrders[0].outItems.length-1]
        this.isLastPoint = true;
      }
    }
    if(this.currentPoints.length == 1 || this.indx == this.currentPoints.length - 1){
      this.title = "Выехал";
    }
    this.currentPoint.loadingUnloadingType = this.currentPoint.loadingUnloadingType.toLowerCase();
    console.log(this.currentPoint.documents);
  }

  photoPuter(){
    console.log(this.indx);
    if(this.indx !== undefined){
      let pointDocs = this.orderService.activeOrders[0].outItems[this.indx].documents;
        console.log(pointDocs);
        this.orderService.photosZagruzkiTest = {'type': null, 'docs': []};
        this.orderService.photosAktTest = {'type': null, 'docs': []};
        this.orderService.photosTransportnayaTest = {'type': null, 'docs': []};

        // if(pointDocs.length > 0){
          for(let i=0; i<pointDocs.length; i++){
            if(pointDocs[i].type == 1){
              console.log(pointDocs[i].type);
              this.orderService.photosZagruzkiTest = pointDocs[i];
            }else if(pointDocs[i].type == 2){
              this.orderService.photosAktTest = pointDocs[i];
            }else if(pointDocs[i].type == 3){
              this.orderService.photosTransportnayaTest = pointDocs[i];
            }
          // }
          console.log('photosZagruzkiTest', this.orderService.photosZagruzkiTest);
          console.log('photosAktTest', this.orderService.photosAktTest);
          console.log('photosTransportnayaTest', this.orderService.photosTransportnayaTest);
        }
    }
  }


  updateDocType(type: string){
    console.log(this.documentAcception);
    if(type == 'good'){

      this.orderService.pointUploadType(this.currentPoint.id, false).then(()=>{
        this.documentAcception = 'good';
        this.currentPoint.damage = 0;
        this.orderService.activeOrders[0].outItems[this.indx].damage = 0;
      }, (error: any)=>{
        this.configService.presentToast(error.message, "error", "middle", false, "", 3000);
      })

    }else if(type == 'bad'){

      this.orderService.pointUploadType(this.currentPoint.id, true).then(()=>{
          this.documentAcception = 'bad';
          this.currentPoint.damage = 1;
        this.orderService.activeOrders[0].outItems[this.indx].damage = 1;
      }, (error: any)=>{
        this.configService.presentToast(error.message, "error", "middle", false, "", 3000);
      })

    }
  }


  // Call agents - by ordet Point(Every point has own agents)
  onCall(){
    this.actionSheet = this.actionSheetCtrl.create();

    for (let i = 0; i < this.currentPoints[this.indx].contacts.length; i++) {
      var button = {
        role: 'destructive',
        icon: 'call',
        cssClass: 'EditionIcon',
        text: this.currentPoints[this.indx].contacts[i].phone + " " + this.currentPoints[this.indx].contacts[i].name,
        handler: () => {
          console.log(this.currentPoints[this.indx].contacts[i].phone);
          this.callNumber.callNumber(this.currentPoints[this.indx].contacts[i].phone, true)
                             .then(() => console.log('Launched dialer!'))
                             .catch(() => console.log('Error launching dialer'));
        }
      }
      this.actionSheet.addButton(button)
    }
    this.actionSheet.present();
  }


  ionViewDidLeave(){
    this.events.unsubscribe('success:activeCame');
  }

  // When user click's button - Приехал к погрузку **************************
  onCame(){
    this.locationTracker.testCheckGps(true, true);
  }

  sendReq(comment){
    if(this.helperService.isNetworkConnected){
      const loader = this.loadingCtrl.create();
      loader.present();
      this.orderService.changeOrderState(this.activeOrder.id, this.configService.orderStates.stCameUnload, comment).then((res: any)=>{
        loader.dismiss();
        console.log(res);
        if(res !== undefined){
          this.locationTracker.triedCameQty = 0;
          this.storageService.removeItem('triedQty');
          this.cameResponse();
        }
      },(error)=>{
        loader.dismiss();
        this.configService.presentToast(error.message, "error", "middle", false, "", 3000);
      })
    }else{
      // this.locationTracker.triedCameQty = 0;
      // this.storageService.removeItem('triedQty');
      this.helperService.driversOfflineData(this.activeOrder.id,
                                            this.orderService.nextPoint.lat,
                                            this.orderService.nextPoint.lng,
                                            this.configService.orderStates.stCameUnload);
      this.cameResponse();
    }
  }  

 

  cameResponse(){
    this.orderService.activeOrders[0].outItems[this.indx].state = 1;
    this.orderService.activeOrders[0].status = 6;
    this.activeOrder.status = 6;
    this.currentPoint.state = 1;
    this.orderService.isUserOnPoint = false;
    this.orderService.nextPoint =  this.orderService.activeOrders[0].outItems[this.indx+1];
    // console.log("BBBBBBBB_______: ",this.orderService.nextPoint);
    if(!this.orderService.nextPoint || !this.orderService.nextPoint == undefined){
      this.orderService.nextPoint =  this.orderService.activeOrders[0].outItems[this.indx];
    }
    // console.log("Next Point Changed", this.orderService.nextPoint);
    

    this.helperService.changeStorageOrderState('activeOrders',
                                               0,
                                               this.orderService.activeOrders[0].id,
                                               this.orderService.activeOrders[0].status,
                                               'outItems',
                                               this.indx,
                                               1);
  }

  
  // When user click's button - Выехал с погрузки **************************
  onGoFrom(){
    if(this.helperService.isNetworkConnected){
      const loader = this.loadingCtrl.create();
      loader.present();
      this.orderService.changeOrderState(this.activeOrder.id, this.configService.orderStates.stGoUnload, '').then((res: any)=>{
        console.log(res);
        loader.dismiss();
        if(res !== undefined){
          this.documentAcception = 'good';

          this.orderService.photosZagruzkiTest = {'type': null, 'docs': []};
          this.orderService.photosAktTest = {'type': null, 'docs': []};
          this.orderService.photosTransportnayaTest = {'type': null, 'docs': []};
          this.goRespinse();
        }
      },(error)=>{
        loader.dismiss();
        this.configService.presentToast(error.message, "error", "middle", false, "", 3000);
      })
    }else{
      this.helperService.driversOfflineData(this.activeOrder.id,
                                            this.orderService.nextPoint.lat,
                                            this.orderService.nextPoint.lng,
                                            this.configService.orderStates.stGoUnload);
      this.goRespinse();
    }
  }

  goRespinse(){
    if(this.indx !== this.currentPoints.length - 1){
          this.title = "Выехал";
          this.currentPoint.state = 2;
          this.orderService.activeOrders[0].outItems[this.indx].state = 2;
          
          this.orderService.activeOrders[0].status = 5;
          this.orderService.activeOrders[0].status = 5;
          this.activeOrder.status = 5;
          

          this.helperService.changeStorageOrderState('activeOrders',
                                                      0,
                                                      this.orderService.activeOrders[0].id,
                                                      this.orderService.activeOrders[0].status,
                                                      'outItems',
                                                      this.indx,
                                                      2);

          this.currentPoint = this.currentPoints[this.indx + 1];
          this.indx = this.indx + 1

          this.orderService.activePoint = this.currentPoint;

          console.log(this.orderService.activePoint);
          if(this.indx == this.currentPoints.length - 1){
            this.orderService.isUserOnPoint = false;
            this.title = "Выехал";
          }
    }else{
      if(this.helperService.isNetworkConnected){
        
        this.currentPoint.state = 2;
        this.orderService.activeOrders[0].status = 5;
        this.orderService.activeOrders[0].outItems[this.indx].state = 2;
        this.isLastPoint = true;

        this.helperService.changeStorageOrderState('activeOrders',
                                                    0,
                                                    this.orderService.activeOrders[0].id,
                                                    this.orderService.activeOrders[0].status,
                                                    'outItems',
                                                    this.indx,
                                                    2);

        if(this.orderService.waitingOrders.length == 0 ){
          this.locationTracker.stopTracking();
        }

      }else{
        this.isDuplicate = true;
        this.isLastPoint = true;

        this.currentPoint.state = 2;
        this.orderService.activeOrders[0].status = 5;
        this.orderService.activeOrders[0].outItems[this.indx].state = 2;
        this.isLastPoint = true;

        this.helperService.changeStorageOrderState('activeOrders',
                                                    0,
                                                    this.orderService.activeOrders[0].id,
                                                    this.orderService.activeOrders[0].status,
                                                    'outItems',
                                                    this.indx,
                                                    2);

      }
    }
  }


  finishOrder(){
    console.log("Finish Order");
    const loader = this.loadingCtrl.create();
    loader.present();
    this.orderService.changeOrderState(this.activeOrder.id, this.configService.orderStates.finishOrder, '').then((res: any)=>{
      console.log(res);
      if(res !== undefined){
        this.isDuplicate = false;
        this.isThereItem = false;
        this.storageService.removeItem('activeOrders');
        this.orderService.activePoint = null;

        let arrayChecker = [];
        this.activeOrder.outItems.forEach(order => {
          let isAttached = false;
          if(order.damage == 0 && order.documents.length > 0){
            // attached
            isAttached = true;
          }else if(order.damage == 0 && order.documents.length == 0){
            // not attached
            isAttached = false;
          }

          if(order.damage == 1 && order.documents.length > 0){
            // attached
            isAttached = true;
          }else if(order.damage == 1 && order.documents.length == 0){
            // not attached
            isAttached = false;
          }
          arrayChecker.push(isAttached);
        });
        let yesAttached = true;
        arrayChecker.forEach(order =>{
          if(!order){
            yesAttached = false;
            return;
          }
        })
        
        var from, to;
        if(yesAttached){
            from = { inx: 0, nameArr: "activeOrders", countName: "activeOrdersQty" };
            to = { nameArr: "historyOrders", item: this.activeOrder, countName: "historyOrdersQty" };
        }else{
            from = { inx: 0, nameArr: "activeOrders", countName: "activeOrdersQty" };
            to = { nameArr: "notAttachedOrders", item: this.activeOrder, countName: "notAttachedOrdersQty" };
        }
        this.orderService.moveFromTo(from, to);

        this.orderService.selectedOrder = null;
        this.orderService.selectedOrderIndx = null;
        this.orderService.nextPoint = null;
      }
      loader.dismiss();
    },(error)=>{
      loader.dismiss();
      this.configService.presentToast(error.message, "error", "middle", false, "", 3000);
    })
  }


  uploadDocuments(docType: number){
    this.orderService.selectedOrder = this.orderService.activeOrders[0];
    this.navCtrl.push(DocumentsPage, {'mode': 1, 'docType': docType, 'pointIndx': this.indx, 'pointId': this.orderService.activeOrders[0].outItems[this.indx].id, 'order': this.orderService.selectedOrder});
  }

  onDelay(){
    const loader = this.loadingCtrl.create();
    loader.present();
    this.orderService.onDelay(this.orderService.activeOrders[0].id).then((res: any)=>{
      if(res !== undefined){
        this.orderService.activeOrders[0].status = 9;
      }
      loader.dismiss();
    }, (error)=>{
      loader.dismiss();
      console.log(error);
      console.log(error.message);
      this.configService.presentToast(error.message, "error", "middle", false, "", 3000);
    })
  }

  onPauseRoute(){
    if (this.helperService.isNetworkConnected) {
      this.presentPrompt();
    } else {
      this.configService.presentToast("Нет соединение с интернетом!", "error", "top", false, "", 4000);
    };
  }

  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Укажите причину задержки в пути',
      inputs: [
        {
          name: 'comment',
          placeholder: 'Комментария...'
        }
      ],
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Отправить',
          handler: data => {
            if (data.comment !== '') {
              const loader = this.loadingCtrl.create();
              loader.present();
              this.orderService.onPause(this.orderService.activeOrders[0].id, data.comment).then(res => {
                loader.dismiss();
                console.log(res);
                this.orderService.activeOrders[0].status = 11;
              }, (error) => {
                loader.dismiss();
                console.log(error);
              });
            } else {
              this.configService.presentToast("Необходимо указать коментарии", "error", "middle", false, "", 4000);
            };
          }
        }
      ]
    });
    alert.present();
  }



}

