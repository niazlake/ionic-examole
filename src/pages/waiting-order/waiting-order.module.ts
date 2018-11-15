import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaitingOrderPage } from './waiting-order';

@NgModule({
  declarations: [
    WaitingOrderPage,
  ],
  imports: [
    IonicPageModule.forChild(WaitingOrderPage),
  ],
})
export class WaitingOrderPageModule {}
