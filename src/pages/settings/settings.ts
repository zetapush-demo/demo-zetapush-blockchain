import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { BeaconDetectionService } from '../../beacon-detection/beacon-detection.service';
import { BeaconApi, BeaconDescription } from '../../beacon-detection/beacon-api.service';
import { Dialogs } from '@ionic-native/dialogs';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})


export class SettingsPage {

  loader = undefined;
  allBeacons: Array<BeaconDescription> = [];

  constructor(
    public navCtrl: NavController,
    private beaconService: BeaconDetectionService,
	private beaconApi: BeaconApi,
	private LoadingController: LoadingController,
    private dialogs: Dialogs) {

      // HANDLE ZETAPUSH
      beaconApi.onListBeaconDescriptions.subscribe((msg) => {
        console.log("onListBeaconDescription", msg);

        let tab = msg['res']['content'];

        tab.forEach(elt => {
            this.allBeacons.push({'data': elt['__key'], 'description': elt['description']});
        });

        if (this.loader != undefined) { this.loader.dismiss();}

      });
    }

    ionViewWillEnter(): void {
      console.log("Ask to get all beacon");

      this.loader = this.LoadingController.create({
        content: "We download the beacon ..."
      });

      this.loader.present().then(() => {
        this.beaconApi.listBeaconDescriptions();
      });
    }

    change(beacon: BeaconDescription){
        console.log("Beacon to change : ", beacon);

        this.dialogs.prompt("Change description of "+ beacon.data, "Change description", ["OK", "Cancel"], beacon.description).then((msg)=> {
            if (msg.buttonIndex == 1){
                this.beaconApi.updateDescription(beacon.data, msg.input1).then((msg) => {
                    this.allBeacons.forEach(elt => {
                        if (elt.data == msg['res']['beacon']){
                            elt.description = msg['res']['description'];
                            this.allBeacons.slice();
                        }
                    })
                })
            }
        })

    }
}
