import { Injectable } from "@angular/core";
import { Order } from "../models/order";
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {

    newOrders: Array<Order>=[];

    constructor(private storage: Storage){}

    storeItem(key: string, value: any){
        this.storage.set(key, JSON.stringify(value));
    }

    storeData(key: string, value: Array<Order>){
        this.storage.set(key, JSON.stringify(value));
    }

    storeOfflineStates(key: string, value: Array<{orderId: string, lat: number, lng: number, time: number, status: number}>){
        this.storage.set(key, JSON.stringify(value));
    }

    storeOfflineDocuments(key: string, value: Array<{'placeId': string, 'type': number, 'docs': Array<string>}>){
        this.storage.set(key, JSON.stringify(value));
    }

    getDataByKey(key: string){
        return this.storage.get(key)
    }

    removeItem(key: string){
        this.storage.remove(key);
    }

    removeObject(key: string, objectIndx: number){
        console.log('objectIndx', objectIndx);
        this.getDataByKey(key).then((result)=>{
            let orders = JSON.parse(result);
            console.log('do slice orders', orders);
            orders.splice(objectIndx,1);
            console.log('posle slice orders', orders);
            this.storeData(key, orders);
        })
    }

    clearStorage(){
        this.storage.clear();
    }
}