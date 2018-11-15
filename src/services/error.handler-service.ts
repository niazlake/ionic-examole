import { ErrorHandler, Injectable, Injector, ViewChild  } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Events, ToastController, NavController, Nav, App } from 'ionic-angular';
import { LoginPage } from '../pages/auth/login/login';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  
  @ViewChild(Nav) nav: Nav;

  constructor(private injector: Injector,
              private toastCtrl: ToastController,
              private appCtrl: App,
              public events: Events) {}


  handleError(error: Error | HttpErrorResponse) {
      if (error instanceof HttpErrorResponse) {
        if(!navigator.onLine) {
            this.presentToast('Please, check your internet connection', 'error', 'top',  3000);
        } else if(error.status === 401){
          console.log("401");
            // this.nav.setRoot(LoginPage);
        }else if(error.error instanceof Error) {
          this.presentToast('An error occurred:' + error.error.message, 'error', 'top',  3000);
        }else{
          console.log(error.error.message);
          this.presentToast(error.error.message, 'error', 'top',  3000);
        }
        console.log(error);
      }
    }


  presentToast(message: string, classType: string, position:string, time: number) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      cssClass: classType,
      duration: time,
      dismissOnPageChange: false
    });
    toast.present();
}
    

}