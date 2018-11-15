import { Injectable, Injector } from "@angular/core";
import { Headers, RequestOptions } from "@angular/http";
import { ToastController } from "ionic-angular/components/toast/toast-controller";
import { Diagnostic } from "@ionic-native/diagnostic";
import { AlertController } from "ionic-angular";
import { LocationTracker } from "../providers/location-tracker";
import { Geolocation } from '@ionic-native/geolocation';

@Injectable()
export class ConfigService {

    apiRoot: string;
    api_key: string;
    headers: Headers;
    options: RequestOptions;

    orderStates: any;

    constructor(private toastCtrl: ToastController,
        private diagnostic: Diagnostic,
        private alertCtrl: AlertController,
        public geolocation: Geolocation,
        private injector: Injector,
    ) {

        this.apiRoot = "https://driver.tn.exdan.ru";
        this.api_key = "L1HBY-BWySrUoZOX5jD4j8e_jcCvZQmp";
        this.headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
        this.options = new RequestOptions({ headers: this.headers });

        this.orderStates = {
            stNew: 0,
            stAccept: 1,
            stGoLoad: 2,
            stCameLoad: 3,
            stRun: 4,
            stGoUnload: 5,
            stCameUnload: 6,
            finishOrder: 7,
            stWait: 11
        }

    }

    presentToast(message: string, classType: string, position: string, showCloseButton: boolean, closeButtonText: string, time: number) {
        let toast = this.toastCtrl.create({
            message: message,
            position: position,
            showCloseButton: showCloseButton,
            closeButtonText: closeButtonText,
            cssClass: classType,
            duration: time,
            dismissOnPageChange: false
        });
        toast.present();
    }


    gpsAelrt() {
        let networkAlert = this.alertCtrl.create({
            title: 'Внимание!',
            message: 'GPS-модуль отключен. Пожалуйста, включите GPS',
            buttons: [
                {
                    text: 'Настройки',
                    handler: () => {
                        this.diagnostic.switchToLocationSettings();
                    }
                }
            ]
        });
        networkAlert.present();
    }




}