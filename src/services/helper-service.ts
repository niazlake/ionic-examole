import { Injectable, ViewChild } from "@angular/core";
import { OrderService } from "./order-service";
import { Order } from "../models/order";
import { In } from "../models/in";
import { LocationTracker } from "../providers/location-tracker";
import { OneSignal } from "@ionic-native/onesignal";
import { Nav } from "ionic-angular";
import { AuthService } from "./auth-service";
import { StorageService } from "./storage-service";
import { NewOrdersPage } from "../pages/new-orders/new-orders";

@Injectable()
export class HelperService {

    @ViewChild(Nav) nav: Nav;

    userActiveOrder: Order;
    isNetworkConnected: boolean = true;
    offlineData: Array<{ orderId: string, lat: number, lng: number, time: number, status: number }> = [];
    offlinePhotos: Array<{ 'placeId': string, 'type': number, 'docs': Array<string> }> = [];
    storageArray: Array<{ 'key': string, 'val': Array<Order> }>;


    constructor(private orderService: OrderService,
        private oneSignal: OneSignal,
        private storageService: StorageService,
        private authService: AuthService,
        private locationTracker: LocationTracker) {

        let tn = JSON.parse(localStorage.getItem("tn"));
        if (tn && tn !== null) {
            if (tn.token && tn.token !== null) {
                this.getWaitingOrders();
                this.getActiveOrders();
            }
        }
    }

    getWaitingOrders() {
        this.orderService.getWaitingOrders(false).then((res: any) => {
            if (res !== undefined) {
                if (res.data.items.length > 0) {
                    this.userActiveOrder = res.data.items;
                    this.catchActivePoint(true);
                }
            }
        }, (error: any) => {
            console.log(error);
        })
    }

    getActiveOrders() {
        this.orderService.getActiveOrders(false).then((res: any) => {
            if (res !== undefined) {
                if (res.data.items.length > 0) {
                    this.userActiveOrder = res.data.items;
                    // this.catchActivePoint(false);
                }
            }
        }, (error: any) => {
            console.log(error);
        })
    }

    oneSignalConf() {
        console.log("init oneSignalConf");

        this.oneSignal.startInit('d89c9563-09d6-4e4d-8e63-1963d7463c87', '432907125436'); //OneSignalAppId (Keys & IDs), Firebase-Идентификатор отправителя(Cloud messaging)

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        this.oneSignal.handleNotificationReceived().subscribe((data: any) => {
            console.log('------------- handleNotificationReceived', data.payload);
            const action = data.payload.additionalData.action;
            const orderId = data.payload.additionalData.id;
            const status = data.payload.additionalData.status;
            let arrayName = '';
            if (action === 'cancel') {
                switch (status) {
                    case 0:
                        arrayName = 'newOrders'
                        break;
                    default:
                        break;
                }
                for (let i = 0; i < this.orderService[arrayName].length; i++) {
                    if (this.orderService[arrayName][i].id === orderId) {
                        this.orderService[arrayName].splice(i, 1);
                    }
                }
            } else if (action == 'new') {
                this.orderService.getNewOrders(true);
            }

            this.storageService.storeData(arrayName, this.orderService[arrayName]);
            console.log('1', this.orderService[arrayName]);
        });

        this.oneSignal.handleNotificationOpened().subscribe((data: any) => {
            console.log('------------- handleNotificationOpened', data);
            //   this.nav.setRoot(NewOrdersPage);
        });

        this.oneSignal.endInit();

        this.oneSignal.getIds().then((ids) => {
            this.authService.userIdForPush = ids.userId;
            console.log("[[[[this.authService.userIdForPush]]]]", this.authService.userIdForPush);
        });

    }

    catchActivePoint(isInItems: boolean) {
        let items: Array<In>;

        if (isInItems) {
            items = this.userActiveOrder[0].inItems;
        } else {
            items = this.userActiveOrder[0].outItems;
        }
        console.log(isInItems, items);

        for (let i = 0; i < items.length; i++) {
            if (items[i].state == 0 || items[i].state == 1) {
                console.log(items.length);
                if (i + 1 !== items.length && items[i].state == 0) {
                    this.orderService.nextPoint = items[i];
                    console.log("1--");
                }
                if (i + 1 == items.length && items[i].state == 1) {
                    this.orderService.nextPoint = this.userActiveOrder[0].outItems[0];
                    console.log("2--");
                }
                if (i + 1 == items.length && items[i].state == 0) {
                    this.orderService.nextPoint = items[i];
                    console.log("3--");
                }
                if (i + 1 !== items.length && items[i].state == 1) {
                    this.orderService.nextPoint = items[i + 1];
                    console.log("4--");
                }

                this.locationTracker.startTracking();
                console.log("Current poin is:", i, this.orderService.nextPoint);
                break;
            } else {
                this.locationTracker.startTracking();
            }
        }
    }

    driversOfflineData(orderId: string, lat: number, lng: number, status: number) {
        let currentTime = new Date().getTime() / 1000;
        console.log(orderId + ", " + lat + ", " + lng + ", " + status);
        let offlineItemData = {
            orderId: orderId,
            lat: lat,
            lng: lng,
            time: currentTime,
            status: status
        }
        if (!this.offlineData) {
            this.offlineData = [];
        }
        this.offlineData.push(offlineItemData);

        this.storageService.getDataByKey('offlineData').then((result) => {
            let offData: Array<{ orderId: string, lat: number, lng: number, time: number, status: number }> = [];
            if (result && result !== null) {
                offData = JSON.parse(result);
                offData.push(offlineItemData);
                this.storageService.removeItem('offlineData');
            } else {
                offData.push(offlineItemData)
            }
            console.log('offData', offData);
            this.storageService.storeOfflineStates('offlineData', offData);
        });

        console.log("OFFLINE DATA", this.offlineData);
    }



    changeStorageOrderState(storageKey: string,
        orderIndex: number,
        orderId: string,
        orderStatus: number,
        pointType: string,
        pointIndex: number,
        pointState: number) {
        console.log("storageKey: " + storageKey + ", orderIndex:" + orderIndex + ", orderStatus:" + orderStatus + ", pointType:" + pointType + ", pointIndex:" + pointIndex + ", pointState:" + pointState);
        let orderArray: Array<Order>;
        this.storageService.getDataByKey(storageKey).then((result) => {
            if (result && result !== null) {
                orderArray = JSON.parse(result);
                if (orderArray[orderIndex].id == orderId) {
                    console.log('Do smena statusa:', orderArray[orderIndex]);
                    orderArray[orderIndex].status = orderStatus;
                    orderArray[orderIndex][pointType][pointIndex].state = pointState;
                    console.log('Posle smena statusa:', orderArray[orderIndex]);
                }
                this.storageService.removeItem(storageKey);
                this.storageService.storeData(storageKey, orderArray);
            }
        })
    }





}