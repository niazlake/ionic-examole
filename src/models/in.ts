import { Contact } from "./contact";

export class In{

    ordinalNumber: number;
    name: string;
    address: string;
    time: number;
    type: number;
    contacts: Array<Contact>;
    state: number;
    lat: number;
    lng: number;
    factory: string;
    loadingUnloadingType: string;
    timeIn: number;
    timeOut: number;
    radius: number;
    id: string;
    documents: Array<{type: number, docs: Array<string>}>;
    damage: number;


    constructor(ordinalNumber: number,
                name: string,
                address: string,
                time: number,
                type: number,
                contacts: Array<Contact>,
                state: number,
                lat: number,
                lng: number,
                factory: string,
                loadingUnloadingType: string,
                timeIn: number,
                timeOut: number,
                radius: number,
                id: string,
                documents: Array<{type: number, docs: Array<string>}>,
                damage: number){
      
        this.ordinalNumber = ordinalNumber;
        this.name = name;
        this.address = address;
        this.time = time;
        this.type = type;
        this.contacts = contacts;
        this.state = state;
        this.lat = lat;
        this.lng = lng;
        this.factory = factory;
        this.loadingUnloadingType = loadingUnloadingType;
        this.timeIn = timeIn;
        this.timeOut = timeOut;
        this.radius = radius,
        this.id = id;
        this.documents = documents;
        this.damage = damage
    }

}