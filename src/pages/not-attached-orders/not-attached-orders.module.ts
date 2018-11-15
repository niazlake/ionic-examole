import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotAttachedOrdersPage } from './not-attached-orders';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    NotAttachedOrdersPage,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicPageModule.forChild(NotAttachedOrdersPage),
    ComponentsModule
  ]
})
export class NotAttachedOrdersPageModule {}
