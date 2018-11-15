import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SettingsProvider {
 
    private theme: BehaviorSubject<String>;
    selectedTheme: String;

    constructor() {
        let tn = JSON.parse(localStorage.getItem("tn"));
        if(tn && tn.mode && tn.mode !== ""){
            this.selectedTheme = tn["mode"];
        }else{
            this.selectedTheme = "light-theme";
            let t = {"token": "", "mode": null};
            t["mode"] = this.selectedTheme;
            localStorage.setItem('tn', JSON.stringify(t));
        }
        this.theme = new BehaviorSubject(this.selectedTheme);
    }
 
    setActiveTheme(val) {
        let tn = JSON.parse(localStorage.getItem("tn"));
        tn.mode = val;
        localStorage.setItem('tn', JSON.stringify(tn));
        this.theme.next(val);
    }
 
    getActiveTheme() {
        return this.theme.asObservable();
    }
}
