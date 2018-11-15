import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { HockeyApp } from 'ionic-hockeyapp';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController,
              private hockeyApp:HockeyApp,
              private navigator: LaunchNavigator,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }


  onNavigate(){
    let link = "yandexnavi://build_route_on_map?lat_from=55.784940&lon_from=49.1463528&lat_to=55.787028&lon_to=49.123306&lat_via_0=55.793506&lon_via_0=49.151008&lat_via_1=55.794387&lon_via_1=49.115088";
    window.open(link, "_system");
  }

  setOrders(){
    // this.sqliteService.setOrders();
  }

    public forceCrash() {
    this.hockeyApp.forceCrash();
  }
}
