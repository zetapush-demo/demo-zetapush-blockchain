import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PhotoPage } from '../photo/photo';
import { BeaconPage } from '../beacon/beacon';
import { LoginPage } from '../login/login';
import { SettingsPage } from '../settings/settings';

import { Dialogs } from '@ionic-native/dialogs';
import { ZetaPushConnection, ZetaPushClient } from 'zetapush-angular';

import { BeaconDetectionService } from '../../beacon-detection/beacon-detection.service';
import { WoleetApi } from '../../woleet/woleet-api.service';
import { DatabaseApi } from '../../woleet/database-api.service';

import { File } from '@ionic-native/file';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  constructor(
    public navCtrl: NavController, 
    private params: NavParams,
    private dialog: Dialogs,  
    private zpConnection: ZetaPushConnection,
    private beaconService: BeaconDetectionService,
    private woleetApi: WoleetApi,
    private dbApi: DatabaseApi,
    private file: File,
    private zpClient: ZetaPushClient) {
    
    woleetApi.onCreateAnchor.subscribe((message) => {
      console.log("onCreateAnchor", message);
      this.dbApi.addNewAnchorId(message['response']['content']['name'], message['response']['content']['id']);
    })

}

  goToPhoto(): void {
    this.navCtrl.push(PhotoPage);
  }

  goToBeacon(): void {
    this.navCtrl.push(BeaconPage);
  }

  goToSettings(): void {
    this.navCtrl.push(SettingsPage);
  }

  goBack(): void {
    console.log("Disconnection from the home page");

    console.log("The application is destroyed");
    this.beaconService.stopScan(); 

    this.dialog.alert("You are disconnected", "Disconnection").then(() => {
        this.zpConnection.disconnect();
        this.navCtrl.push(LoginPage);
    });
  }

  ngOnInit(): void {
    console.log("The application start");
    this.beaconService.startScan();

    // Create the directory
    this.file.checkDir("file:///storage/emulated/0/", "ZetaPush").then((res) => {}).catch(() => {
      this.file.createDir("file:///storage/emulated/0/", "ZetaPush", false).then(msg => { 
        console.log("Directory created");
        this.file.createDir("file:///storage/emulated/0/ZetaPush/", "Beacons", false).then(msg => console.log('Directory Beacon created'));
        this.file.createDir("file:///storage/emulated/0/ZetaPush/", "Pictures", false).then(msg => console.log('Directory Picture created'));
      }).catch(err => { console.error("Error creating directory")});
    })

  }
}
