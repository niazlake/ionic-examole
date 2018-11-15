import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckMyDetailPage } from './check-my-detail';

@NgModule({
  declarations: [
    CheckMyDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckMyDetailPage),
  ],
})
export class CheckMyDetailPageModule {}
