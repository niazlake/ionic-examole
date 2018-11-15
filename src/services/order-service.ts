import { Injectable } from "@angular/core";
import { LoadingController, Events } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/catch';

import 'rxjs/Rx';

import { Order } from "../models/order";
import { In } from "../models/in";
import { ConfigService } from "./config";
import { StorageService } from "./storage-service";
import { ErrorHandlerService } from "./error.handler-service";


@Injectable()
export class OrderService {

    newOrders: Array<Order>=[];
    newOrdersQty: number = 0;
    waitingOrders: Array<Order>=[];
    waitingOrdersQty: number = 0;
    activeOrders: Array<Order>=[];
    activeOrdersQty: number = 0;
    historyOrders: Array<Order>=[];
    historyOrdersQty: number = 0;

    notAttachedOrders: Array<Order>=[];
    notAttachedOrdersQty: number = 0;

    selectedOrder: Order;
    isInItems: boolean = true; // for order tab - Загрузка/Погрузка
    isNetworkConnected: boolean = true;

    selectedOrderIndx: number;
    activePoint: In;
    nextPoint: In;
    isUserOnPoint: boolean = false;

    selectedOrderTitle: number;

    photosZagruzki: {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};
    photosAkt: {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};
    photosTransportnaya: {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};


    photosZagruzkiTest: {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};
    photosAktTest: {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};
    photosTransportnayaTest: {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};

    selectedDocType:  {'type': number, 'docs': Array<string>} = {'type': null, 'docs': []};

    constructor(private httpC: HttpClient,
                public loadingCtrl: LoadingController,
                public events: Events, 
                private errorHandlerService: ErrorHandlerService, 
                private storageService: StorageService,
                private configService: ConfigService){

        let tn = JSON.parse(localStorage.getItem("tn"));
        if(tn && tn!== null){
            if(tn.token && tn.token!==null){
                this.getNewOrders(true);
                this.getClosedOrders(false);
                this.getNotAttachedOrders(false);
            }
        }
    }

    // *************************************** Gets New Orders ********************************* //    
    getNewOrders(showLoader: boolean){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/now?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then((res: any) => {
                    this.newOrders = res.data.items;
                    this.newOrdersQty = this.newOrders.length;
                    this.storageService.storeData('newOrders', this.newOrders);
                    this.events.publish('user:login');
                    return res;
                }).catch(
                    this.errorHandlerService.handleError.bind(this.errorHandlerService)
                );
    }


    // *************************************** ЛонгПул **************************************** //
    longPoll(timer: Number){
        let tn = JSON.parse(localStorage.getItem("tn"));
        if(tn && tn!=='null'){
            console.log("************* Подписываеся longPoll *********************")
            let apiURL = `${this.configService.apiRoot}/longpool?updated_at=` + timer + "&access_token=" + tn.token + "&api_key=" + this.configService.api_key;
            this.httpC.get(apiURL)
            .subscribe((data: any) => {
                console.log(data.data);
                let appoint = data.data.commands.appoint;
                console.log(appoint);
                var isNotDublicate =  true;
                if(appoint){
                    let items = appoint.items;
                    console.log("APPOINT - command", items);
                    for(let i=0; i<items.length; i++){
                        let item = items[i];
                        for(let j=0; j<this.newOrders.length; j++){
                            if(this.newOrders[j].id === item.id){
                                isNotDublicate = false;
                                console.log("isNotDublicate: " + isNotDublicate);
                            }
                        }
                        if(isNotDublicate){
                            this.newOrders.unshift(item);
                            this.newOrdersQty = this.newOrders.length;
                            this.events.publish('user:login');
                            isNotDublicate = true;
                        }
                    }
                    console.log("Поздравляем! Вам назначен заказ.Срочно подтвердите рейс.");
                }
                
                this.longPoll(data.data.last);
            },(err) => {
                // console.log(err);
                if(tn.token && tn.token !== null){
                    this.longPoll(0);
                }
            });
        }
    }


    // *************************************** Gets Information About Selected Order ************** //    
    getNewOrderInfo(id){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/` + id + `?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then(res => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Gets Driver Information To Check If Is It OK **** //    
    getMyDetail(){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/user?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then(res => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Sent ERROR  message ***************************** //    
    onErrorUserdata(id: number, message: string){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/`+ id +`/report-error?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.put(apiURL, {message: message}).toPromise()
            .then(res => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Gets Waiting Orders ***************************** //    
    getWaitingOrders(showLoader: boolean){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/wait?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then((res: any) => {
                this.waitingOrders = res.data.items;
                this.waitingOrdersQty = this.waitingOrders.length;
                this.events.publish('user:login');
                this.storageService.storeData('waitingOrders', this.waitingOrders);
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Gets Active Orders ****************************** //    
    getActiveOrders(showLoader: boolean){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/active?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then((res: any) => {
                this.activeOrders = res.data.items;
                this.activeOrdersQty = this.activeOrders.length;
                this.storageService.storeData('activeOrders', this.activeOrders);
                this.events.publish('user:login');
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Change Order State ********************************* //
    changeOrderState(id: string, status: number, comment: string){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/` + id + `/change-status?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.put(apiURL, {status: status, comment: comment}).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Get Closed Orders ****************************** //    
    getClosedOrders(showLoader: boolean){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/history?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then((res: any) => {
                this.historyOrders = res.data.items;
                this.historyOrdersQty = this.historyOrders.length;
                this.events.publish('user:login');
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }
    

    getNotAttachedOrders(showLoader: boolean){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/no-document?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL).toPromise()
            .then((res: any) => {
                this.notAttachedOrders = res.data.items;
                this.notAttachedOrdersQty = this.notAttachedOrders.length;
                this.storageService.storeData('notAttachedOrders', this.notAttachedOrders);
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Sending user Coordinates  ****************************** //    
    sendUserCoords(lat: number, lng: number){
        console.log("sendUserCoords()");
        if(this.isNetworkConnected && lat != null && lng != null){
            let tn = JSON.parse(localStorage.getItem("tn"));
            let apiURL = `${this.configService.apiRoot}/user/gps?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
            return this.httpC.post(apiURL, {"latitude": lat, "longitude": lng}).toPromise()
                .then(res => {
                    return res;
                }).catch(
                    this.errorHandlerService.handleError.bind(this.errorHandlerService)
                );
        }
    }


    sendOfflineData(states: Array<{orderId: string,lat: number, lng: number, time: number, status: number}>){
        let tn = JSON.parse(localStorage.getItem("tn"));
        // const loader = this.loadingCtrl.create({content: "Подождите, идет синхронизация данных.."});
        let apiURL = `${this.configService.apiRoot}/order/change-status-pack?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.post(apiURL, {"offlinedata": states}).toPromise()
            .then(res => {
                console.log("RES GPS", res);
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    sendDocuments(pointId: string, type: number, docs: Array<string>){
        let creds = {
            'type': type,
            'docs': docs
        };
        
        console.log(creds);
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/place/`+ pointId +`/attach-document?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.put(apiURL, creds).toPromise()
            .then(res => {
                    console.log("RES DOC", res);
                    return true;
                }).catch(
                    this.errorHandlerService.handleError.bind(this.errorHandlerService)
                );
    }


    sendPackDocuments(offlineDocs: Array<{'placeId': string, 'type': number, 'docs': Array<string>}>){
        // const loader = this.loadingCtrl.create({content: "Подождите, идет синхронизация данных.."});
        let creds = {
            'items': offlineDocs
        };
        console.log(creds);
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/place/attach-document-pack?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.post(apiURL,creds).toPromise()
            .then(res => {
                console.log("RES SENDPACKDOCS", res);
                return true;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    pointUploadType(pointId: string, damage: boolean){ // false - без поврежд, true - с повреждением
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/place/`+ pointId +`/damage?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.put(apiURL, {'damage': damage}).toPromise()
            .then(res => {
                console.log("RES pointUploadType", res);
                return true;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Mover Function (moves order from one module to another) ****************************** //    
    moveFromTo(from, to){
        if(to){
            this[to.nameArr].unshift(to.item);
            this[to.countName] = this[to.nameArr].length;
        }
        this[from.nameArr].splice(from.inx,1);
        this[from.countName] = this[from.nameArr].length;
        this.events.publish('user:login');
        
        console.log(from.nameArr + ' array is: ', this[from.nameArr]); 
    }

    setNewOrdersToStrorage(){
        console.log("do remove setNewOrdersToStrorage");
        this.storageService.removeItem('newOrders');
        console.log("posle remove setNewOrdersToStrorage");
        this.storageService.storeData('newOrders', this.newOrders);
        console.log("done setNewOrdersToStrorage", this.newOrders);
    };

    onDelay(orderId: string){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/`+ orderId +`/delay?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.put(apiURL, {}).toPromise()
            .then(res => {
                console.log("RES onDelay", res);
                return true;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }

    onPause(id: string, comment: string){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/order/${id}/delay-run?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.put(apiURL, {comment}).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }

    getMessages(){
        let tn = JSON.parse(localStorage.getItem("tn"));
        let apiURL = `${this.configService.apiRoot}/message?access_token=` + tn.token + "&api_key=" + this.configService.api_key;
        return this.httpC.get(apiURL, {}).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }

}