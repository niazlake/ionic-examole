import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewOrdersPage } from './new-orders';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    NewOrdersPage,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicPageModule.forChild(NewOrdersPage),
    ComponentsModule
  ]
})
export class NewOrdersPageModule {}

