import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ZetaPushConnection } from 'zetapush-angular';
import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';

@Component({
selector: 'page-login',
templateUrl: 'login.html'
})

export class LoginPage implements OnInit {

    user: string = "";
    password: string = "";

    constructor(
        public navCtrl: NavController, 
        private platform: Platform,
        private toast: ToastController,  
        private zpConnection: ZetaPushConnection
        
    ){}

    ngOnInit(): void {
        this.user = "";
        this.password = "";
    }

    login(): void {
        
        if (this.user.length == 0) {
            this.toast.create({
                message: "The user is empty",
                duration: 3000
            }).present();
        } else if (this.password.length == 0){
            this.toast.create({
                message: "The password is empty",
                duration: 3000
            }).present();
        } else {
            this.platform.ready().then(() => {

                this.zpConnection.connect({'login':this.user, 'password':this.password}).then((res) => {
                    console.debug("ZetaPushConnection:OK");
                    this.navCtrl.push(HomePage, {
                        login: this.user
                    });

                }).catch((err) => {
                    console.log("Connection error", err);
                    this.toast.create({
                        message: "Connection error",
                        duration: 3000
                    }).present();
                    this.user = "";
                    this.password = "";
                })
            });
        }

    }

    register(): void {
        this.navCtrl.push(RegisterPage);
    }
}