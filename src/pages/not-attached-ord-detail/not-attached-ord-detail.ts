import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Slides } from 'ionic-angular';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order-service';
import { ConfigService } from '../../services/config';
import { DocumentsPage } from '../documents/documents';
import { HelperService } from '../../services/helper-service';

@IonicPage()
@Component({
  selector: 'page-not-attached-ord-detail',
  templateUrl: 'not-attached-ord-detail.html',
})
export class NotAttachedOrdDetailPage {
  @ViewChild(Slides) slides: Slides;
  isLoading: boolean = false;

  constructor(public navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private orderService: OrderService,
              private configService: ConfigService,
              private helperService: HelperService,
              public navParams: NavParams) {

      this.photoPuter(0);

  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    this.photoPuter(currentIndex);
  }

  photoPuter(indx: number){
      if(indx <= this.orderService.selectedOrder.outItems.length-1){
        this.isLoading = true;
        this.orderService.photosZagruzkiTest = {'type': null, 'docs': []};
        this.orderService.photosAktTest = {'type': null, 'docs': []};
        this.orderService.photosTransportnayaTest = {'type': null, 'docs': []};
      
        let pointDocs = this.orderService.selectedOrder.outItems[indx].documents;

          for(let i=0; i<pointDocs.length; i++){
            if(pointDocs[i].type == 1){
              this.orderService.photosZagruzkiTest = pointDocs[i];
            }else if(pointDocs[i].type == 2){
              this.orderService.photosAktTest = pointDocs[i];
            }else if(pointDocs[i].type == 3){
              this.orderService.photosTransportnayaTest = pointDocs[i];
            }
          }
      }
      this.isLoading = false;
      console.log('photosZagruzkiTest', this.orderService.photosZagruzkiTest);
      console.log('photosAktTest', this.orderService.photosAktTest);
      console.log('photosTransportnayaTest', this.orderService.photosTransportnayaTest);
  }


  finishOrder(){
    console.log("Finish Order");
    const loader = this.loadingCtrl.create();
    loader.present();
    this.orderService.changeOrderState(this.orderService.selectedOrder.id, this.configService.orderStates.finishOrder, '').then((res)=>{
      console.log("Finish Order Success", res);
      if(res !== undefined){
        var from, to;
        from = { inx: 0, nameArr: "notAttachedOrders", countName: "notAttachedOrdersQty" };
        to = { nameArr: "historyOrders", item: this.orderService.selectedOrder, countName: "historyOrdersQty" };
        this.orderService.moveFromTo(from, to);
        this.navCtrl.pop();
      }
      loader.dismiss();
    },(error)=>{
      console.log("Finish Order Erro");
      loader.dismiss();
    })
  }


  uploadDocuments(docType: number, pointIndx, pointId){
    this.navCtrl.push(DocumentsPage, {'mode': 1, 'docType': docType, 'pointIndx': pointIndx, 'pointId': pointId, 'order': this.orderService.selectedOrder});
  }


}
