import { Injectable } from "@angular/core";
import { ToastController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/catch';

import 'rxjs/Rx';
import { ConfigService } from "./config";
import { ErrorHandlerService } from "./error.handler-service";

@Injectable()
export class AuthService {

    isRegistration: boolean =  false;
    userIdForPush: string = "";
    isNetworkConnected: boolean = true;
    packageName = "ru.eradv.technickol";

    constructor(private http: HttpClient,
                private toastCtrl: ToastController,
                private errorHandlerService: ErrorHandlerService, 
                private configService: ConfigService){
        
    }

    presentToast(message: string, classType: string, position:string, showCloseButton:boolean, closeButtonText: string, time: number) {
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


    // *************************************** Get Sms Code For Registration (new user) ********************************* //    
    getSmsCodce(phone: string){
        let apiURL = `${this.configService.apiRoot}/register?phone=` + phone + `&api_key=` + this.configService.api_key;
        return this.http.get(apiURL).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }
    

    // *************************************** Sending phone and password to regist. ********************************* //    
    requestToRegistration(phone: string, code: string){
        let apiURL = `${this.configService.apiRoot}/register?api_key=` + this.configService.api_key;
        return this.http.post(apiURL, {"phone": phone, "code": code}).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


    // *************************************** Get Sms Code To Sign In ************************************************** //    
    getSmsToLogin(phone: string){
        let apiURL = `${this.configService.apiRoot}/login?phone=` + phone + `&api_key=` + this.configService.api_key;
        return this.http.get(apiURL).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }
    

    // *************************************** Sending phone && code to Sing In ***************************************** //    
    requestToLogin(phone: string, code: string){
        let apiURL = `${this.configService.apiRoot}/login?api_key=` + this.configService.api_key;
        console.log('{}{}{}{}{}{}{}{}', this.userIdForPush);
        return this.http.post(apiURL,{"phone": phone, "code": code, "onesignal_player_id": this.userIdForPush}).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }

    // *************************************** Sending phone && code to Sing In ***************************************** //    
    getAppVersion(){
        let apiURL = 'https://play.google.com/store/apps/details?id=' + this.packageName;
        console.log('{}{}{}{}{}{}{}{} - getAppVersion');
        const options = {responseType: 'text' as 'text'};
        return this.http.get(apiURL, options).toPromise()
            .then((res) => {
                return res;
            }).catch(
                this.errorHandlerService.handleError.bind(this.errorHandlerService)
            );
    }


}