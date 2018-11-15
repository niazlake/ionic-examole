import { Injectable, NgZone, Injector } from "@angular/core";
import { BackgroundGeolocation } from "@ionic-native/background-geolocation";
import { Geolocation, GeolocationOptions } from "@ionic-native/geolocation";

import {
  Platform,
  AlertController,
  LoadingController,
  Events,
  FabList
} from "ionic-angular";
import { AuthService } from "../services/auth-service";
import { OrderService } from "../services/order-service";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Diagnostic } from "@ionic-native/diagnostic";
import { Inject } from "@angular/compiler/src/core";
import { ConfigService } from "../services/config";
import { StorageService } from "../services/storage-service";

@Injectable()
export class LocationTracker {
  public lat: number = null;
  public lng: number = null;

  public idBg: any;
  public idFg: any;

  testRadius: number = 1000;

  dist: number;
  s: boolean = false;

  triedCameQty = 0;

  constructor(
    public zone: NgZone,
    public geolocation: Geolocation,
    public backgroundGeolocation: BackgroundGeolocation,
    public orderService: OrderService,
    private locationAccuracy: LocationAccuracy,
    private diagnostic: Diagnostic,
    private alertCtrl: AlertController,
    private injector: Injector,
    public loadingCtrl: LoadingController,
    private configService: ConfigService,
    private storageService: StorageService,
    public events: Events,
    public platform: Platform
  ) {
    this.platform.pause.subscribe(() => {
      this.getUserBackgroundPosition();
      if (this.idFg) {
        clearInterval(this.idFg);
      }
    });
    //Subscribe on resume
    this.platform.ready().then(() => {
      this.startTracking();
    });

    this.storageService.getDataByKey("triedQty").then(result => {
      if (result !== undefined) {
        this.triedCameQty = JSON.parse(result);
      } else {
        this.triedCameQty = 0;
      }
    });

    this.platform.resume.subscribe(() => {
      this.startTracking();
      if (this.idBg) {
        clearInterval(this.idBg);
      }
      this.backgroundGeolocation.stop();
      this.backgroundGeolocation.finish();
    });
  }

  getUserBackgroundPosition() {
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: false,
      interval: 2000
    };

    this.idBg = setInterval(() => {
      this.backgroundGeolocation.configure(config).subscribe(
        location => {
          console.log(
            "BackgroundGeolocation:  " +
            location.latitude +
            "," +
            location.longitude
          );
          // Run update inside of Angular's zone
          this.zone.run(() => {
            this.lat = location.latitude;
            this.lng = location.longitude;
            // this.lat = 55.782606;
            // this.lng = 49.146980;
          });
          console.log("BACKGRAUND", this.lat, this.lng);
        },
        err => {
          console.log(err);
        }
      );
    }, 20000);
    // Turn ON the background - geolocation system.
    this.backgroundGeolocation.start();
  }

  startTracking() {
    console.log("*****START startTracking()*****");

    this.getUserCurrentPosition();
    // Foreground Tracking
    this.idFg = setInterval(() => {
      let tn = JSON.parse(localStorage.getItem("tn"));
      if (tn.token && tn.token !== null) {
        this.getUserCurrentPosition();
      }
    }, 20000);
  }

  stopTracking() {
    console.log("*****STOP stopTracking()*****");
    this.backgroundGeolocation.stop();
    this.backgroundGeolocation.finish();
    this.lat = null;
    this.lng = null;
    if (this.idFg || this.idBg) {
      clearInterval(this.idBg);
      clearInterval(this.idFg);
    }
    setTimeout(() => {
      this.backgroundGeolocation.stop();
      if (this.idFg || this.idBg) {
        clearInterval(this.idFg);
        clearInterval(this.idBg);
      }
    }, 1000);
  }

  async getUserCurrentPosition() {
    try {
      await this.platform.ready();
      const { coords } = await this.geolocation.getCurrentPosition();
      this.lat = coords.latitude;
      this.lng = coords.longitude;
      // this.lat = 55.782606;
      // this.lng = 49.146980;
    } catch (e) {
      // alert("1: Error on Geo: " + e);
    }
  }

  calculateUserDistance() {
    this.diagnostic.isGpsLocationEnabled().then(state => {
      if (state) {
        var options = {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 0
        };
        this.geolocation
          .getCurrentPosition(options)
          .then(resp => {
            this.lat = resp.coords.latitude;
            this.lng = resp.coords.longitude;
            // this.lat = 55.782606;
            // this.lng = 49.146980;
            this.getRadius();
          })
          .catch(error => {
            // alert("2: Error geolocation plugin: " + error.message);
          });
      } else {
        this.testCheckGps(null, false);
      }
    });
  }

  getRadius() {
    let dist;
    if (
      this.orderService.nextPoint &&
      this.orderService.nextPoint.lat !== undefined
    ) {
      dist = this.distance(
        [this.lat, this.lng],
        [this.orderService.nextPoint.lat, this.orderService.nextPoint.lng]
      );
    }
    console.log(dist);
    if (
      dist !== undefined &&
      dist < this.orderService.nextPoint.radius * this.testRadius
    ) {
      this.orderService.isUserOnPoint = true;
    } else {
      this.orderService.isUserOnPoint = false;
    }
    this.orderService.sendUserCoords(this.lat, this.lng);
  }

  testCheckGps(isActiveOrder: boolean, isFromOrder: boolean) {
    console.log("testCheckGps");
    this.diagnostic.isGpsLocationEnabled().then(
      state => {
        if (!state) {
          this.testYTurnOnGps(isActiveOrder, isFromOrder);
          this.s = true;
        } else {
          this.testGetCurrentPosition(isActiveOrder, isFromOrder);
          this.s = true;
        }
      },
      error => {
        // alert("isGpsLocationEnabled: " + error);
      }
    );
  }

  testYTurnOnGps(isActiveOrder: boolean, isFromOrder: boolean) {
    this.locationAccuracy.canRequest().then(
      (canRequest: boolean) => {
        if (canRequest) {
          this.locationAccuracy
            .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
            .then(
              () => {
                this.testGetCurrentPosition(isActiveOrder, isFromOrder);
              },
              error => {
                console.log(
                  "Error requesting location permissions",
                  error.message
                );
                this.s = false;
              }
            );
        } else {
          this.s = false;
        }
      },
      error => {
        // alert("canRequest: " + error);
      }
    );
  }

  testGetCurrentPosition(isActiveOrder: boolean, isFromOrder: boolean) {
    console.log("testGetCurrentPosition");

    var options = { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 };

    this.geolocation
      .getCurrentPosition(options)
      .then(resp => {
        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;
        // this.lat = 55.782606;
        // this.lng = 49.146980;
        if (isFromOrder) {
          this.testCalcDistance(isActiveOrder);
        } else {
          this.s = false;
        }
        this.orderService.sendUserCoords(this.lat, this.lng);
      })
      .catch(error => {
        this.s = false;
        const alert = this.alertCtrl.create({
          title: "Не удалось определить положение. Попробуйте еще раз",
          buttons: [
            {
              text: "ОК",
              handler: () => { }
            }
          ]
        });
        alert.present();
      });
  }

  testCalcDistance(isActiveOrder: boolean) {
    console.log("testCalcDistance");
    let dist;
    if (
      this.orderService.nextPoint &&
      this.orderService.nextPoint.lat !== undefined
    ) {
      dist = this.distance(
        [this.lat, this.lng],
        [this.orderService.nextPoint.lat, this.orderService.nextPoint.lng]
      );
    }
    console.log(dist);
    if (
      dist !== undefined &&
      dist < this.orderService.nextPoint.radius * this.testRadius
    ) {
      console.log("dist ok", dist);
      this.orderService.isUserOnPoint = true;
      this.testSendRequest(isActiveOrder);
    } else {
      console.log("dist bad", dist);
      this.orderService.isUserOnPoint = false;
      this.s = false;
      if (isActiveOrder) {
        if (this.triedCameQty === 2) {
          this.presentPrompt();
        } else {
          this.triedCameQty += 1;
          this.storageService.storeItem("triedQty", this.triedCameQty);
          this.testPresentAlert();
        }
      } else {
        this.testPresentAlert();
      }
    }
  }

  testSendRequest(isActiveOrder: boolean) {
    this.s = false;
    if (isActiveOrder) {
      this.events.publish("success:activeCame");
    } else {
      this.events.publish("success:waitingCame");
    }
  }

  presentPrompt() {
    const prompt = this.alertCtrl.create({
      title: "Вы вне зоны выгрузки!",
      message:
        "До зоны выгрузки " +
        this.dist / 1000 +
        " км. Переместитесь ближе к месту выгрузки.",
      inputs: [
        {
          name: "comment",
          placeholder: "Комментария"
        }
      ],
      buttons: [
        {
          text: "Отмена",
          handler: data => {
            console.log("Cancel clicked");
          }
        },
        {
          text: "Отправить",
          handler: data => {
            this.orderService.isUserOnPoint = true;
            this.events.publish("success:activeCame", data.comment);
            console.log("Yo tried Comment sent: ", data, this.triedCameQty);
          }
        }
      ]
    });
    prompt.present();
  }

  testPresentAlert() {
    let text =
      "До зоны выгрузки " +
      this.dist / 1000 +
      " км. Переместитесь ближе к месту выгрузки.";
    let alert = this.alertCtrl.create({
      title: "Вы вне зоны выгрузки!",
      subTitle: text,
      buttons: ["OK"]
    });
    alert.present();
  }

  distance(start: Array<number>, end: Array<number>) {
    console.log("USER location: ", start);
    console.log("POINT location: ", end);

    if (start.length != 2) return false;
    if (end.length != 2) return false;

    //радиус Земли
    const R = 6372795;
    const M_PI = 3.14159265358979323846;

    //перевод коордитат в радианы
    var lat1 = (start[0] * M_PI) / 180;
    var lat2 = (end[0] * M_PI) / 180;
    var lon1 = (start[1] * M_PI) / 180;
    var lon2 = (end[1] * M_PI) / 180;

    //вычисление косинусов и синусов широт и разницы долгот
    var cl1 = Math.cos(lat1);
    var cl2 = Math.cos(lat2);
    var sl1 = Math.sin(lat1);
    var sl2 = Math.sin(lat2);
    var delta = lon2 - lon1;
    var cdelta = Math.cos(delta);
    var sdelta = Math.sin(delta);
    //вычисления длины большого круга
    var y = Math.sqrt(
      Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2)
    );
    var x = sl1 * sl2 + cl1 * cl2 * cdelta;
    var ad = Math.atan2(y, x);
    var dists = Math.round(ad * R); //расстояние между двумя координатами в метрах
    this.dist = dists;
    return this.dist;
  }
}
