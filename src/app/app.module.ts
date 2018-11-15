import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { TextMaskModule } from 'angular2-text-mask';

//Tabs
import { OrderInfoTab } from '../pages/orderInfoTab';

//Plugins
import { CallNumber } from '@ionic-native/call-number';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { AppAvailability } from '@ionic-native/app-availability';
import { Market } from '@ionic-native/market';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera } from '@ionic-native/camera';
import { AppVersion } from '@ionic-native/app-version';

import { ConfigService } from '../services/config';
import { AuthService } from '../services/auth-service';
import { HelperService } from '../services/helper-service';
import { SettingsProvider } from '../providers/settings';
import { LocationTracker } from '../providers/location-tracker';
import { OrderService } from '../services/order-service';
import { StorageService } from '../services/storage-service';
import { LoginPage } from '../pages/auth/login/login';
import { SmsCodePage } from '../pages/auth/sms-code/sms-code';
import { ActiveOrderPageModule } from '../pages/active-order/active-order.module';
import { CheckMyDetailPageModule } from '../pages/check-my-detail/check-my-detail.module';
import { ClosedOrdersPageModule } from '../pages/closed-orders/closed-orders.module';
import { LoadingGoodsPageModule } from '../pages/loading-goods/loading-goods.module';
import { MessagePageModule } from '../pages/message/message.module';
import { NotAttachedOrdersPageModule } from '../pages/not-attached-orders/not-attached-orders.module';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { WaitingOrderPageModule } from '../pages/waiting-order/waiting-order.module';
import { WaitingOrdersPageModule } from '../pages/waiting-orders/waiting-orders.module';

import { OneSignal } from '@ionic-native/onesignal';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { DocumentsPageModule } from '../pages/documents/documents.module';
import { NotAttachedOrdDetailPageModule } from '../pages/not-attached-ord-detail/not-attached-ord-detail.module';
import { ErrorHandlerService } from '../services/error.handler-service';
import { NewOrdersPageModule } from '../pages/new-orders/new-orders.module';
import { HockeyApp } from 'ionic-hockeyapp';
import { SentryErrorHandler } from '../services/sentry-errorhandler';
import { HelpPageModule } from '../pages/help/help.module';

@NgModule({
  declarations: [
    MyApp,
    OrderInfoTab,
    LoginPage,
    SmsCodePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    TextMaskModule,
    ActiveOrderPageModule,
    NewOrdersPageModule,
    CheckMyDetailPageModule,
    ClosedOrdersPageModule,
    LoadingGoodsPageModule,
    MessagePageModule,
    NotAttachedOrdersPageModule,
    SettingsPageModule,
    WaitingOrderPageModule,
    WaitingOrdersPageModule,
    DocumentsPageModule,
    NotAttachedOrdDetailPageModule,
    HelpPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    OrderInfoTab,
    LoginPage,
    SmsCodePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HttpClientModule,
    SettingsProvider,
    LocationTracker,
    CallNumber,
    Diagnostic,
    Network,
    Geolocation,
    BackgroundGeolocation,
    AppAvailability,
    Market,
    LaunchNavigator,
    InAppBrowser,
    LocationAccuracy,
    OneSignal,
    Camera,
    ConfigService,
    AuthService,
    HelperService,
    OrderService,
    StorageService,
    ErrorHandlerService,
    HockeyApp,
    AppVersion,
    // SentryErrorHandler,
    // { provide: ErrorHandler, useClass: SentryErrorHandler }
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
