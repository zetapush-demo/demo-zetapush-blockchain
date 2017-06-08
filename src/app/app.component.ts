import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ZetaPushClient } from 'zetapush-angular'; 

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';

import { ZetaPushConnection } from 'zetapush-angular';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, zpClient: ZetaPushClient, private zpConnection: ZetaPushConnection) {

    console.log("STRONGLY CONNECTED : ", zpClient.isStronglyAuthenticated());
    zpClient.isStronglyAuthenticated() ? this.rootPage = HomePage : this.rootPage = LoginPage;
    let token = zpClient.getCredentials();
    console.log("USER ID : ", token);

    platform.ready().then(() => {

      if (zpClient.isStronglyAuthenticated()){
        this.zpConnection.connect(token).then((res) => {
          console.debug("ZetaPushConnection:OK");
        });
      }

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

