import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaitingOrdersPage } from './waiting-orders';

@NgModule({
  declarations: [
    WaitingOrdersPage,
  ],
  imports: [
    IonicPageModule.forChild(WaitingOrdersPage),
  ],
})
export class WaitingOrdersPageModule {}
