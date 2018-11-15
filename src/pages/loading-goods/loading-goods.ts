import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, LoadingController, Platform } from 'ionic-angular';
import { OrderService } from '../../services/order-service';
import { Order } from '../../models/order';
import { ConfigService } from '../../services/config';
import { AppAvailability } from '@ionic-native/app-availability';
import { Market } from '@ionic-native/market';
import { CallNumber } from '@ionic-native/call-number';
import { CheckMyDetailPage } from '../check-my-detail/check-my-detail';
import { InAppBrowser } from '@ionic-native/in-app-browser';


@IonicPage()
@Component({
  selector: 'page-loading-goods',
  templateUrl: 'loading-goods.html',
})
export class LoadingGoodsPage {

  selectedOrder: Order;
  inCoords: Array<{ lat: number, lng: number }> = [];
  outCoords: Array<{ lat: number, lng: number }> = [];

  constructor(public navCtrl: NavController,
    private app: App,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private orderService: OrderService,
    private configService: ConfigService,
    private platform: Platform,
    private appAvailability: AppAvailability,
    private market: Market,
    private iab: InAppBrowser,
    private callNumber: CallNumber,
    public navParams: NavParams) {

    this.selectedOrder = this.orderService.selectedOrder;

  }

  checkMyDetail() {
    console.log(this.orderService.isNetworkConnected);
    if (!this.orderService.isNetworkConnected) {
      this.configService.presentToast("Нет соединение с интернетом!", "error", "middle", false, "", 4000);
    } else {
      const loader = this.loadingCtrl.create();
      loader.present();

      this.orderService.getMyDetail().then((res: any) => {
        loader.dismiss();
        res.data["orderId"] = this.selectedOrder.id;
        res.data["orderNumber"] = this.selectedOrder.number;
        this.app.getRootNav().push(CheckMyDetailPage, { userData: res.data });
      }, (error: any) => {
        loader.dismiss().then(() => {
          this.configService.presentToast(error.data.message, "error", "middle", false, "", 2500);
        });
      })
    }
  }


  openYandexNavigator() {
    this.inCoords = [];
    this.outCoords = [];

    for (let i = 0; i < this.selectedOrder.inItems.length; i++) {
      let incord = {
        lat: this.selectedOrder.inItems[i].lat,
        lng: this.selectedOrder.inItems[i].lng
      };
      this.inCoords.push(incord);
    }
    for (let j = 0; j < this.selectedOrder.outItems.length; j++) {
      let outcord = {
        lat: this.selectedOrder.outItems[j].lat,
        lng: this.selectedOrder.outItems[j].lng
      };
      this.outCoords.push(outcord);
    }


    var startEndPoints = {
      'lat_from': this.inCoords[0].lat,
      'lon_from': this.inCoords[0].lng,
      'lat_to': this.outCoords[this.outCoords.length - 1].lat,
      'lon_to': this.outCoords[this.outCoords.length - 1].lng
    };

    var middleInPoints = new Object;
    var middleOutPoints = new Object;
    var viaCounter = 0;

    if (this.inCoords.length > 0) {
      for (let k = 1; k < this.inCoords.length; k++) {
        var a = "lat_via_" + (viaCounter);
        var b = "lon_via_" + (viaCounter);
        middleInPoints[a] = this.inCoords[k].lat;
        middleInPoints[b] = this.inCoords[k].lng;
        viaCounter++;
      }
    }
    if (this.outCoords.length > 0) {
      for (let k = 0; k < this.outCoords.length - 1; k++) {
        let a = "lat_via_" + (viaCounter);
        let b = "lon_via_" + (viaCounter);
        middleOutPoints[a] = this.outCoords[k].lat;
        middleOutPoints[b] = this.outCoords[k].lng;
        viaCounter++;
      }
    }

    var querystring;
    if (middleInPoints[Object.keys(middleInPoints)[0]] && middleOutPoints[Object.keys(middleOutPoints)[0]]) {

      querystring = this.encodeQueryData(startEndPoints) + "&" + this.encodeQueryData(middleInPoints) + "&" + this.encodeQueryData(middleOutPoints);
    } else if (middleInPoints[Object.keys(middleInPoints)[0]] && !middleOutPoints[Object.keys(middleOutPoints)[0]]) {

      querystring = this.encodeQueryData(startEndPoints) + "&" + this.encodeQueryData(middleInPoints);
    } else if (!middleInPoints[Object.keys(middleInPoints)[0]] && middleOutPoints[Object.keys(middleOutPoints)[0]]) {

      querystring = this.encodeQueryData(startEndPoints) + "&" + this.encodeQueryData(middleOutPoints);
    } else if (!middleInPoints[Object.keys(middleInPoints)[0]] && !middleOutPoints[Object.keys(middleOutPoints)[0]]) {

      querystring = this.encodeQueryData(startEndPoints);
    }

    let link = "yandexnavi://build_route_on_map?" + querystring;
    this.checkAndLaunchYandexNavi(link);
  }


  encodeQueryData(data) {
    let ret = [];
    for (let d in data)
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
  }


  checkAndLaunchYandexNavi(link) {
    let app;
    if (this.platform.is('android')) {
      app = 'ru.yandex.yandexnavi';
    }

    this.appAvailability.check(app).then((yes: boolean) => {
      window.open(link, "_system");
    }, (no: boolean) => {
      this.showErrorAlert();
    });
  }


  showErrorAlert() {
    let alert = this.alertCtrl.create({
      title: 'Ошибка!',
      subTitle: 'Не установлено Яндекс.Навигатор!',
      buttons: [
        {
          text: 'Отмена',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Установить',
          handler: data => {
            this.market.open('ru.yandex.yandexnavi');
          }
        }
      ]
    });
    alert.present();
  }

  onCall(phone: string) {
    this.callNumber.callNumber(phone, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }

}
