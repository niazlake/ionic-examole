import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoadingGoodsPage } from './loading-goods';

@NgModule({
  declarations: [
    LoadingGoodsPage,
  ],
  imports: [
    IonicPageModule.forChild(LoadingGoodsPage),
  ],
})
export class LoadingGoodsPageModule {}
