import { Component } from "@angular/core";
import { NavController, NavParams, AlertController } from "ionic-angular";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { SettingsProvider } from "../../../providers/settings";
import { AuthService } from "../../../services/auth-service";
import { HelperService } from "../../../services/helper-service";
import { SmsCodePage } from "../sms-code/sms-code";
import { InAppBrowser } from "@ionic-native/in-app-browser";

@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  selectedTheme: String;
  public masks: any;
  private loginForm: FormGroup;
  isLoading: Boolean = false;
  agree: Boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private settings: SettingsProvider,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private helperService: HelperService,
    private formBuilder: FormBuilder,
    private iab: InAppBrowser
  ) {
    this.settings.getActiveTheme().subscribe(val => (this.selectedTheme = val));
    this.masks = {
      phone: [
        "+",
        "7",
        /[1-9]/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/
      ]
    };

    this.loginForm = this.formBuilder.group({
      phone: ["", Validators.required]
    });
  }

  toggleAppTheme() {
    if (!this.isLoading) {
      if (this.selectedTheme === "dark-theme") {
        this.settings.setActiveTheme("light-theme");
      } else {
        this.settings.setActiveTheme("dark-theme");
      }
    }
  }

  getCode() {
    this.isLoading = true;
    if (this.authService.isRegistration) {
      if (this.agree) {
        this.authService.getSmsCodce(this.loginForm.value.phone.substr(1)).then(
          (res: any) => {
            this.isLoading = false;
            if (res !== undefined) {
              // this.helperService.oneSignalConf();
              this.authService.presentToast(
                res.data.message,
                "success",
                "top",
                false,
                "",
                3000
              );
              this.navCtrl.push(SmsCodePage, {
                phone: this.loginForm.value.phone.substr(1)
              });
            }
          },
          error => {
            this.isLoading = false;
          }
        );
      } else {
        this.isLoading = false;
        let alert = this.alertCtrl.create({
          title: "Для продолжения регистрации примите Соглашения!",
          buttons: [
            {
              text: "ОК",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              }
            },
          ]
        });
        alert.present();
      }
    } else {
      this.authService.getSmsToLogin(this.loginForm.value.phone.substr(1)).then(
        (res: any) => {
          this.isLoading = false;
          if (res !== undefined) {
            // this.helperService.oneSignalConf();
            this.authService.presentToast(
              res.data.message,
              "success",
              "top",
              false,
              "",
              3000
            );
            this.navCtrl.push(SmsCodePage, {
              phone: this.loginForm.value.phone.substr(1)
            });
          }
        },
        error => {
          this.isLoading = false;
        }
      );
    }
  }

  showPopup(text) {
    let alert = this.alertCtrl.create({
      title: text,
      buttons: [
        {
          text: "Отмена",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          }
        },
        {
          text: "Регистрация",
          handler: () => {
            this.authService.isRegistration = true;
            this.getCode();
          }
        }
      ]
    });
    alert.present();
  }

  registrationLabel() {
    this.authService.isRegistration = !this.authService.isRegistration;
    console.log(this.authService.isRegistration);
  }

  onClickContent() {
    if (
      this.loginForm.value.phone.length > 0 &&
      this.loginForm.value.phone.length !== 12
    ) {
      let phone = this.loginForm.value.phone.slice(0, 12);
      this.loginForm.controls["phone"].setValue(phone);
    }
  }

  showExternalLinkAlert(url: string, text: string) {
    const prompt = this.alertCtrl.create({
      subTitle: "Открыть " + text + "?",
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel',
          handler: () => { }
        },
        {
          text: 'Да',
          handler: () => {
            this.iab.create(url, '_system');
          }
        }
      ]
    });
    prompt.present();
  }


}
