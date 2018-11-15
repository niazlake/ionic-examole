import { In } from "./in";
import { PhysicalData } from "./physicalData";

export class Order {
    id: string;
    number: string;
    date: number;
    status: number;

    buyerName: string;
    buyerPhone: string;
    supplierName: string;
    supplierPhone: string;

    forwardingAgentName: string;
    forwardingAgentPhone: string;
    physicalDada: Array<PhysicalData>;
    inItems: Array<In>;
    outItems: Array<In>;
    textError: string;

    constructor (id: string,
                 number: string,
                 date: number,
                 status: number,
                 buyerName: string,
                 buyerPhone: string,
                 supplierName: string,
                 supplierPhone: string,
                 forwardingAgentName: string,
                 forwardingAgentPhone: string,
                 physicalDada: Array<PhysicalData>,
                 inItems: Array<In>,
                 outItems: Array<In>,
                 textError: string){
      
        this.id = id;
        this.number = number;
        this.date = date;
        this.status = status;

        this.buyerName = buyerName;
        this.buyerPhone = buyerPhone;
        this.supplierName = supplierName;
        this.supplierPhone = supplierPhone;

        this.forwardingAgentName = forwardingAgentName;
        this.forwardingAgentPhone = forwardingAgentPhone;
        this.physicalDada = physicalDada;
        this.inItems = inItems;
        this.outItems = outItems;
        this.textError = textError;
    }
    
}