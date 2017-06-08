import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ZetaPushConnection } from 'zetapush-angular';
import { ToastController } from 'ionic-angular';
import { UserApi } from '../../user/user-api.service';
import { LoginPage } from '../login/login';

@Component({
selector: 'page-register',
templateUrl: 'register.html'
})

export class RegisterPage {

    user: string = "";
    password: string = "";
    email: string = "";

    constructor(
        public navCtrl: NavController, 
        private platform: Platform,
        private zpConnection: ZetaPushConnection,
        private toast: ToastController, 
        private userApi: UserApi, 
    ){}

    createUser(): void {
        console.log("Create user called");

        if (this.user.length == 0 || this.password.length == 0 || this.email.length == 0) {
            this.toast.create({
                message: "The form is not complete",
                duration: 3000
            }).present();
        } else {
            console.log("Launch create user to ZetaPush");

            this.zpConnection.connect().then(() => {
                    console.debug("ZetaPushConnection:OK");
                    
                    this.userApi.createUser(this.user, this.password, {'email': this.email}).then( (res) => {
                        console.log("User created", res);
                        this.toast.create({
                            message: "The user " + res['user']['login'] + " was created",
                            duration: 3000
                        }).present();

                        this.navCtrl.push(LoginPage);

                    }).catch( (err) => {
                        console.log("Error during create user", err);

                        this.toast.create({
                            message: "This user already exist",
                            duration: 3000
                        }).present();
                    })
            })
        }
    }

}