import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { BeaconDetectionService } from '../../beacon-detection/beacon-detection.service';
import { BeaconApi, BeaconDetection } from '../../beacon-detection/beacon-api.service';
import { WoleetApi } from '../../woleet/woleet-api.service';
import { Dialogs } from '@ionic-native/dialogs';
import { DatabaseApi } from '../../woleet/database-api.service';
import { DetailsBeaconPage } from '../detailsBeacon/detailsBeacon';


@Component({
  selector: 'page-beacon',
  templateUrl: 'beacon.html'
})
export class BeaconPage {

  loader = undefined;
  allBeaconDetected: Array<BeaconDetection> = [];

  constructor(
    public navCtrl: NavController,
    private beaconService: BeaconDetectionService,
		private beaconApi: BeaconApi,
    private woleetApi: WoleetApi,
	  private LoadingController: LoadingController,
    private dialogs: Dialogs,
    private dbApi: DatabaseApi) {

      // HANDLE ZETAPUSH
      woleetApi.onDispatchBeacon.subscribe((message) => {
            console.log("PageDetails::onDispatch", message);

            // Get informations
            let tab = (message['anchor']['name']).split("**");
            let data = tab[0];
            let timestamp = tab[1];
            let statut = message['anchor']['status'];

            // Update beacon detection
            this.allBeaconDetected.forEach(elt => {
              if (elt.data == data && elt.timestamp == timestamp){
                elt.statut = statut;
              }
            });
        })


      beaconApi.onNewBeaconDetection.subscribe((msg) => {
        console.log("NewBeaconDetection", msg);

        let detection: BeaconDetection = {
            'data': msg['res']['data'],
            'device': msg['res']['device'],
            'distance': msg['res']['distance'],
            'timestamp': msg['res']['timestamp'],
            'statut': msg['res']['statut'],
            'description': msg['res']['description']
        };
        this.allBeaconDetected.push(detection);
        this.allBeaconDetected = this.allBeaconDetected.slice();
      });

      beaconApi.onGetAllBeaconDetections.subscribe((msg) => {
        console.log("GetAllBeaconDetection", msg);

        this.allBeaconDetected = [];
        let tab = msg['tabOfRow'];
        tab.forEach(elt => {
          
          let detection: BeaconDetection = {
            'data': elt['detection']['res']['data'],
            'device': elt['detection']['res']['device'],
            'distance': elt['detection']['res']['distance'],
            'timestamp': elt['detection']['res']['timestamp'],
            'statut': elt['detection']['res']['statut'],
            'description': elt['detection']['res']['description']
          };
          this.allBeaconDetected.push(detection);
        });

        if (this.loader != undefined) { this.loader.dismiss();}

      });


      beaconApi.onDeleteBeaconDetection.subscribe((msg) => {

        console.log("onDeleteBeaconDetection", msg);
        let name = msg['res']['data'] + "**" + msg['res']['timestamp'];
        this.dbApi.getAnchorId(name).then((msg) => {
          this.woleetApi.deleteAnchor(msg['id']);
          this.dbApi.removeAnchorId(name);
        })
        
      });
    }

    ionViewWillEnter(): void {
      console.log("Ask to get all beacon detections");

      this.loader = this.LoadingController.create({
        content: "We download the beacon detections..."
      });

      this.loader.present().then(() => {
         this.beaconApi.getAllBeaconDetections();
      });
    }

    /**
	 * Function to show more details about an item
	 */
    showItem(beacon): void {
        console.log("Show item", beacon);

        this.navCtrl.push(DetailsBeaconPage, {
            parameters: beacon
        });
    }

    // Delete a file on the ZetaPush platform
    delete(detection): void {

        this.dialogs.confirm("Delete this detection ?", "Delete", ["YES", "NO"]).then((number) => {
            if (number == 1) {
                // Delete the detection
                this.beaconApi.deleteBeaconDetection(String(detection.timestamp));
                
                this.allBeaconDetected.forEach(elt => {
                  if (elt.timestamp == detection.timestamp){
                      let index = this.allBeaconDetected.indexOf(elt, 0);
                      if(index > -1) { this.allBeaconDetected.splice(index, 1)};
                      this.allBeaconDetected = this.allBeaconDetected.slice();
                  }
                });
            }

        }).catch((error) => {
            console.error("Error during delete process", error);
        })
    }
}
