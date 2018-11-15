import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { OrderService } from '../services/order-service';
import { LoadingGoodsPage } from './loading-goods/loading-goods';

@Component({
    selector: 'order-info-tab',
    template: `
    <button ion-button clear icon-only (click)="close()" style="position: absolute;
                                                                top: 10px; left: 5px;
                                                                z-index: 999;
                                                                color: #ffffff">
        <ion-icon name="md-arrow-back" style="color: white;"></ion-icon>
    </button>
    <ion-tabs  tabsPlacement="top" color="{{ modeColor }}">
        <ion-tab [root]="tab1Root" (ionSelect)="tab(0)" tabTitle="Погрузка"></ion-tab>
        <ion-tab [root]="tab2Root" (ionSelect)="tab(1)" tabTitle="Доставка"></ion-tab>
    </ion-tabs>
	`
})
export class OrderInfoTab {
    
    tab1Root: any = LoadingGoodsPage;
    tab2Root: any = LoadingGoodsPage;
    modeColor: string = "danger";

    constructor(private viewCtrl: ViewController, private orderService: OrderService){
        let localstor = JSON.parse(localStorage.getItem("tn"));
        localstor.mode == "light-theme" ? this.modeColor="danger" : this.modeColor="dark";
	}
	close(){
		this.viewCtrl.dismiss();
    }
    
    tab(ind: number){
        if(ind == 0 ){
            this.orderService.isInItems = true;
        }else{
            this.orderService.isInItems = false;
        }
    }

}
