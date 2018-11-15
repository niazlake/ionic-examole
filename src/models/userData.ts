export class UserData{
    
    firstname: string;
    lastname: string;
    surname: string;
    phone: string;
    passportSerial: string;
    passportNumber: string;
    passportAgency: string;
    car: Car;
    
        constructor( firstname: string,
                    lastname: string,
                    surname: string,
                    phone: string,
                    passportSerial: string,
                    passportNumber: string,
                    passportAgency: string,
                    car: Car){
          
                this.firstname = firstname;
                this.lastname = lastname;
                this.surname = surname;
                this.phone = phone;
                this.passportSerial = passportSerial;
                this.passportNumber = passportNumber;
                this.passportAgency = passportAgency;
                this.car = car;
        }
    
}

class Car{
    
    brand: string;
    gosnumber: string;
    type: string;
    cuzovType: string;
    value: string; // грузоподъемность
    capasity: string;  //объем

    constructor(brand: string,
                gosnumber: string,
                type: string,
                cuzovType: string,
                value: string,
                capasity: string){

        this.brand = brand;
        this.gosnumber = gosnumber;
        this.type = type;
        this.cuzovType = cuzovType;
        this.value = value;
        this.capasity = capasity;

    }
}
