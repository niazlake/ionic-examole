import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OrderCardComponent } from './order-card/order-card';
import { PointCardComponent } from './point-card/point-card';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [
		OrderCardComponent,
		PointCardComponent
	],
	imports: [
        IonicModule
	],
	schemas: [
		CUSTOM_ELEMENTS_SCHEMA
	],
	exports: [
		OrderCardComponent,
		PointCardComponent
	]
})
export class ComponentsModule {}
