import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OrderService } from '../../services/order-service';

@IonicPage()
@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
})
export class MessagePage {

  messages: Array<{id: string, text: string, date: number}> = [];
  isLoading = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
             private orderService: OrderService) {
      this.getMessages();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagePage');
  }

  getMessages(){
    this.isLoading = true;
    this.orderService.getMessages().then((res: any) => {
      this.isLoading = false;
      this.messages = res.data.items;
    }, error => {
      this.isLoading = false;
    })
  }

}
