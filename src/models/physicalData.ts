export class PhysicalData{

    bodySpace: string;
    descriptionOfCargo: string;
    loadingWeight: string;
    packCode: string;
    quantityOfCargo: string;

    constructor(bodySpace: string,
                descriptionOfCargo: string,
                loadingWeight: string,
                packCode: string,
                quantityOfCargo: string){
      
        this.bodySpace = bodySpace;
        this.descriptionOfCargo = descriptionOfCargo;
        this.loadingWeight = loadingWeight;
        this.packCode = packCode;
        this.quantityOfCargo = quantityOfCargo;
    }

}