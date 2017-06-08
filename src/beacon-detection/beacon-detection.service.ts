import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { BeaconApi, BeaconDetection } from './beacon-api.service';
import jsSHA from 'jssha';
import { WoleetApi, Anchor } from '../woleet/woleet-api.service';


@Injectable()
export class BeaconDetectionService {

	// Variables
	uuidDevice: string;
	timerScan: number;

	constructor(
		private beaconApi: BeaconApi, 
		private platform: Platform, 
		private device: Device,
		private woleetApi: WoleetApi){

		// Get device informations
		this.platform.ready().then(() => {
			this.uuidDevice = this.device.uuid;
		})


		beaconApi.onNewBeaconDetection.subscribe((msg) => {
        	console.log("NewBeaconDetection", msg);
			
			// Get the current complete object
			let shaObject = new jsSHA("SHA-256", "BYTES");
			shaObject.update(msg['res']);
			let hash = shaObject.getHash("HEX");

			// Create a new Anchor
			this.createAnchor(msg['res']['data'] + '**' + String(msg['res']['timestamp']), hash);
		});



	}

	/**
	 * Start the scan to detect beacons
	 */
	startScan(){

		this.timerScan = setInterval(() => {

		this.platform.ready().then(readySource => {
			if (readySource === 'cordova'){
        		console.log("Scan in progress...");
        		evothings.eddystone.startScan(
          		(beacon) => {
					  
            		beacon.timeStamp = Date.now();
            		// Detect URL >and< UID Eddystone beacon
					let beaconDetection: BeaconDetection = {
						device: this.uuidDevice,
						timestamp: beacon.timeStamp,
						distance: evothings.eddystone.calculateAccuracy(beacon.txPower, beacon.rssi),
						data: null,
						statut: "WAIT",
						description: null
					}

					console.log("Beacon distance = ", beaconDetection.distance);

            		if (beacon.url != undefined && beaconDetection.distance <= 0.80){
						beaconDetection.data = beacon.url;
						beaconDetection.description = beacon.url;
						this.beaconApi.newBeaconDetection(beaconDetection);	
					} else if (beacon.nid != undefined && beaconDetection.distance <= 0.80){
            			beaconDetection.data = this.uint8ArrayToString(beacon.nid) + " - " + this.uint8ArrayToString(beacon.bid);
						beaconDetection.description = this.uint8ArrayToString(beacon.nid) + " - " + this.uint8ArrayToString(beacon.bid);
						this.beaconApi.newBeaconDetection(beaconDetection);
					}
					
				},
          		(error) => {
            		console.log("Error during the scan :", error);
          		});

				setTimeout(() => {
					evothings.eddystone.stopScan();
					console.log("Stop the scan");
				}, 1500);
      		};
		})
		}, 15000);
	}

	/**
	 * Stop the scan
	 */
	stopScan() {
		evothings.eddystone.stopScan();
		clearInterval(this.timerScan);
		console.log("Scan is stopped");
	}

	// Method to transform UID namespace and instance to a String Object
	uint8ArrayToString(uint8Array) {
		function format(x)
		{
			var hex = x.toString(16);
			return hex.length < 2 ? '0' + hex : hex;
		}
		var result = '';
		for (var i = 0; i < uint8Array.length; ++i)
		{
			result += format(uint8Array[i]);
		}
		return result;
	}

	createAnchor(name, hash): void {

        let anchor: Anchor = {
            id: null,
            created: null,
            lastModified: null,
            name: name,
            hash: hash,
            signedHash: null,
            pubKey: null,
            signature: null,
            identityURL: null,
            public_: false,
            tags: ['beacon'],
            metadata: null,
            callbackURL: null,
            status: null,
            timestamp: null,
            confirmations: null,
            txId: null
        }
        this.woleetApi.createAnchor(anchor);
    }

}
