import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { SettingsProvider } from '../../../providers/settings';
import { AuthService } from '../../../services/auth-service';
import { OrderService } from '../../../services/order-service';
import { LoginPage } from '../login/login';
import { NewOrdersPage } from '../../new-orders/new-orders';

@Component({
  selector: 'page-sms-code',
  templateUrl: 'sms-code.html',
})
export class SmsCodePage {

  selectedTheme: String;
  private smsForm: FormGroup;
  phone: string;
  isLoading: Boolean = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private settings: SettingsProvider,
              private orderService: OrderService,
              private authService: AuthService,
              private formBuilder: FormBuilder) {
      
      this.settings.getActiveTheme().subscribe((val) => {
        setTimeout(() => {
          this.selectedTheme = val
        }, 0);
      });
                
      this.phone = this.navParams.get("phone");

      this.smsForm = this.formBuilder.group({
        code:  ['', Validators.required]
      });

  }


  login(){
    this.isLoading = true;
    // REGISTRATION - If user is New
    if(this.authService.isRegistration){
      this.authService.requestToRegistration(this.phone, this.smsForm.value.code).then((res: any)=>{
          this.isLoading = false;
          if(res !== undefined){
            this.authService.isRegistration = false;
            this.authService.presentToast(res.data.message, "success", "top", false, "", 3000);
            this.navCtrl.setRoot(LoginPage);
          }
          
      }, (error)=>{
          this.isLoading = false;
      })
    }else{
    // LOGIN - If user is registred
      this.authService.requestToLogin(this.phone, this.smsForm.value.code).then((res: any)=>{
          this.isLoading = false;
          if(res !== undefined){
            let tn = JSON.parse(localStorage.getItem("tn"));
            tn["token"] = res.data.access_token;
            localStorage.setItem('tn', JSON.stringify(tn));
            this.updateOrders();
            this.navCtrl.setRoot(NewOrdersPage);
            this.authService.isRegistration = false;
        }
      }, (error)=>{
          this.isLoading = false;
      })
    }
  
  }


  updateOrders(){
    this.orderService.getNewOrders(true);
    this.orderService.getWaitingOrders(false);
    this.orderService.getActiveOrders(false);
    this.orderService.getClosedOrders(false);
    this.orderService.getNotAttachedOrders(false);
  }


}
