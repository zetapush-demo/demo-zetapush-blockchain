import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DatabaseApi } from '../../woleet/database-api.service';
import { WoleetApi } from '../../woleet/woleet-api.service';
import { Dialogs } from '@ionic-native/dialogs';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { LoadingController } from 'ionic-angular';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';


@Component({
selector: 'page-detailsBeacon',
templateUrl: 'detailsBeacon.html',
styles: ['./detailsBeacon.scss']
})

export class DetailsBeaconPage {

    public parameters: any;
    private receipt: any;
    loader;

    constructor(
        public navCtrl: NavController,
        public params: NavParams,
        private dbApi: DatabaseApi,
        private woleetApi: WoleetApi,
        private dialogs: Dialogs,
        private notif: LocalNotifications,
        private LoadingController: LoadingController,
        private transfer: Transfer,
        private file: File,){
            this.parameters = params.get("parameters");
        }


    ionViewDidLoad() {
        console.log("Page details shown", this.parameters);

        let name = this.parameters.data + "**" + this.parameters.timestamp;
        this.dbApi.getAnchorId(name).then((message) => {

            this.woleetApi.getReceipt(message['id']).then((message) => {
                let dataStr = JSON.stringify(message['content']);

                if (message['content']['extra'] == undefined){
                    this.receipt = undefined;
                } else {

                    let jsonObject = JSON.parse(dataStr);
                                    
                    this.receipt = {
                        'version': jsonObject['header']['chainpoint_version'],
                        'hashType': jsonObject['header']['hash_type'],
                        'merkle': jsonObject['header']['merkle_root'],
                        'txId': jsonObject['header']['tx_id'],
                        'timestamp': (jsonObject['header']['timestamp'])*1000,
                        'targetHash': jsonObject['target']['target_hash'],
                        'anchorId': jsonObject['extra'][0]['anchorid']
                    }

                }
            });
        });
    }

    downloadReceipt(): void {
        
        console.log("Launch download");

        const fileTransfer: TransferObject = this.transfer.create();
    
        // Ask to get the anchor
        this.dbApi.getAnchorId(this.parameters.data + "**" + this.parameters.timestamp).then((message) => {
            console.log("Get anchor ID : ", message);
        
            // Get the content of the anchor
            this.woleetApi.getReceipt(message['id']).then((message) => {

                let dataStr = JSON.stringify(message['content']);

                // Check if the anchor is ready
                if (message['content']['extra'] == undefined){
                    this.dialogs.alert("The receipt is not yet ready")
                } else {
                    // Create and save the file
                    this.file.createFile("file:///storage/emulated/0/ZetaPush/Beacons", 'receipt_' + this.parameters.timestamp + '.json', true).then((msg) => {
                        console.log("MSG = > ", msg);
                    
                        this.file.writeExistingFile("file:///storage/emulated/0/ZetaPush/Beacons", 'receipt_' + this.parameters.timestamp + '.json', dataStr).then((msg) => {
                            
                            this.notif.schedule({
                                id: 1,
                                title: 'Receipt',
                                text: 'The receipt is ready, you can open the file chooser'
                            });

                    }).catch((err) => {
                        console.error("writeExistingFile error :", err);
                    })
                    }).catch((err) => {
                        console.error("CreateFile error :", err);
                    })
                }
            })
            
        })

    }
}