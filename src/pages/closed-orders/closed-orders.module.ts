import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClosedOrdersPage } from './closed-orders';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ClosedOrdersPage,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicPageModule.forChild(ClosedOrdersPage),
    ComponentsModule
  ]
})
export class ClosedOrdersPageModule {}
