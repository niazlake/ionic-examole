import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActiveOrderPage } from './active-order';

@NgModule({
  declarations: [
    ActiveOrderPage,
  ],
  imports: [
    IonicPageModule.forChild(ActiveOrderPage),
  ],
})
export class ActiveOrderPageModule {}
