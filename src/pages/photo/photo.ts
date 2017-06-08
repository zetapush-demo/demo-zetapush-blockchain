import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { WoleetApi } from '../../woleet/woleet-api.service';
import { FileApi } from '../../file/file-api.service';
import { DatabaseApi } from '../../woleet/database-api.service';
import { Dialogs } from '@ionic-native/dialogs';
import { Geolocation } from '@ionic-native/geolocation';
import { FileUpload } from '../../file/file-upload.service';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { DetailsPhotoPage } from '../detailsPhoto/detailsPhoto';

// All metadata for a picture
export interface MetadataImage {
    tags: Array<string>;
    latitude: number;
    longitude: number;
    timestamp: number;
    status: string;
}

// Image with his metadata
export interface ImageObject {
    picture: string;
    tags: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    status: string;
    path: string;
}



@Component({
  selector: 'page-photo',
  templateUrl: 'photo.html'
})
export class PhotoPage implements OnInit {

  photos: Array<ImageObject> = [];
  loader;

  options : CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
    }


  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    private woleetApi: WoleetApi,
    private fileApi: FileApi,
    private dbApi: DatabaseApi,
	private platform: Platform,
	private dialogs: Dialogs,
	private LoadingController: LoadingController,
	private geolocation: Geolocation,
	private upload: FileUpload,
	private notif: LocalNotifications,
    ) {


        // =========================================================================================
        //                                  HANDLES ZETAPUSH
        // =========================================================================================
        woleetApi.onDispatch.subscribe((message) => {
            console.log("PageDetails::onDispatch", message);

            let status = message['res']['anchor']['status'];
            let name = message['res']['anchor']['name'];
            let id = message['res']['anchor']['created'];
            let icon = message['res']['url'];

            // We send a new notification
            this.showNotification(status, name, id, icon);

            // Update metadata
            this.woleetApi.updateStatus(name, status);
        })

        woleetApi.onUpdateStatus.subscribe((message) => {
            console.log("onUpdateMetadata", message);
            this.fileApi.getFileEntryList({'folder': '/', 'owner': null});
        })


        fileApi.onGetFileEntryList.subscribe((message) => {
            console.log("onGetFileEntryList", message);

            this.photos = [];

            // Get all photos from the ZetaPush platform
            message['entries']['content'].forEach(element => {
                let img : ImageObject = {
                    'picture': element['metadata']['thumb-200'] != undefined ? element['metadata']['thumb-200']['url'] : element['url']['url'],
                    'tags': (element['metadata']['tags']).join(","),
                    'latitude': +element['metadata']['latitude'],
                    'longitude': +element['metadata']['longitude'],
                    'timestamp': +element['metadata']['timestamp'],
                    'status': element['metadata']['status'],
                    'path': element['url']['path']
                }
                this.photos.push(img);
            })
        })


        fileApi.onDeleteFileEntry.subscribe((message) => {
            console.log("onDeleteFileEntry", message);
            this.fileApi.getFileEntryList({'folder': '/', 'owner': null});

            // Delete the Anchor ID
            this.dbApi.getAnchorId(message['path']).then((msg) => {
                this.woleetApi.deleteAnchor(msg['id']);
                this.dbApi.removeAnchorId(message['path']);
            })
        })
    }

	/**
	 * Get all photos from the ZetaPush platform on the init
	 * We upload a new file if we start the application from the gallery
	 */
	ngOnInit(): void {
		
		this.platform.ready().then(() => {
			this.fileApi.getFileEntryList({'folder': "/", 'owner': null});

			if (window['plugins'] != undefined && window['plugins'].intent != undefined) {
		
				window['plugins'].intent.getCordovaIntent((intent) => {
					console.log("getCordovaIntent", intent);

					if (intent['clipItems'] != undefined) {
						let uri = intent['clipItems'][0]['uri'];

						this.dialogs.confirm("Upload this picture ?", "Upload from gallery", ["YES", "NO"]).then((number) => {
							if (number == 1) {

								this.loader = this.LoadingController.create({
									content: "We convert the picture..."
								});

								this.loader.present().then(() => {
									
									this.convertImgToBase64URL(uri, (base64Image) => {
										
										fetch(base64Image).then(res => res.blob()).then(blob => {
											this.loader.dismiss();

											this.dialogs.prompt("Type tags (separated by commas)", "Upload picture", ["OK"], "").then((msg) => {
												if (msg.buttonIndex == 1) {
													let tags = msg.input1.split(",");
												
													// Create an image object
													let picture : MetadataImage = {
														'tags': tags,
														'latitude': null,
														'longitude': null,
														'timestamp': Date.now(),
														'status': null 
													};

													// Get the position
													this.geolocation.getCurrentPosition().then((resp) => {

														picture.latitude = resp.coords.latitude;
														picture.longitude = resp.coords.longitude;

														// Upload the file
														this.uploadFile(blob, picture);

													}).catch((error) => {
														console.error('Error getting location', error);
													});
												}

											}).catch((e) => {
												console.error("Error in the prompt box :", e);
											});
										})
									})

								})
							}

						}).catch((error) => {
							console.error("Error during upload process", error);
						})

					}
				});
			}
		});
	}


	/**
	 * Function to take a photo and upload it on the ZetaPush platform with metadata (date, localisation)
	 */
    takePhoto(): void {

        this.platform.ready().then(() => {
            this.camera.getPicture(this.options).then((image) => {

				// Create blob object
				let base64Image = 'data:image/jpeg;base64,' + image;

				this.loader = this.LoadingController.create({
					content: "We convert the picture..."
				});

            	this.loader.present().then(() => {
                	fetch(base64Image).then(res => res.blob()).then(blob => {
                		this.loader.dismiss();

                		this.dialogs.prompt("Type tags (separated by commas)", "Upload picture", ["OK"], "").then((msg) => {
                    		if (msg.buttonIndex == 1) {
                        		let tags = msg.input1.split(",");
                        
                        		// Create an image object
								let picture : MetadataImage = {
									'tags': tags,
									'latitude': null,
									'longitude': null,
									'timestamp': Date.now(),
									'status': null 
								};

                                picture.latitude = 1.0;
                                picture.longitude = 1.0;
                                this.uploadFile(blob, picture);

								// // Get the position
								// this.geolocation.getCurrentPosition().then((resp) => {

								// 	picture.latitude = resp.coords.latitude;
								// 	picture.longitude = resp.coords.longitude;

								// 	// Upload the file
								// 	this.uploadFile(blob, picture);

								// }).catch((error) => {
								// 	console.error('Error getting location', error);
								// });
                    		}

						}).catch((e) => {
							console.error("Error in the prompt box :", e);
						});
                	})
            	})

			}, (err) => {
				console.error("Error taking photo, ", err);
			}); 
        });
    }


	/**
	 * Function to abstract the upload process
	 */
    uploadFile(picture: any, metadata: any) {

        this.loader = this.LoadingController.create({
            content: "We upload the picture...",
            dismissOnPageChange: true
        });

        this.loader.present();

        // Send the picture
        let file = this.upload.add({
            folder: '/',
            owner: null,
            file: picture
        });
        
		this.upload.request(file).then((request) => {
            console.log('FileUploadComponent::onRequest', request);
            return this.upload.upload(request);
		}).then((request) => {
			console.log('FileUploadComponent::onUpload', request);
			return this.upload.confirm(request, metadata);
		}).then((request) => {
			console.log('FileUploadComponent::onConfirm', request);
			this.loader.dismiss();
			this.fileApi.getFileEntryList({'folder': '/', 'owner': null});
		});
    }

    /**
	 * Function to delete a picture on the ZetaPush platform
	 */
    delete(path): void {
        console.log("URL", path);

        this.dialogs.confirm("Delete this picture ?", "Delete", ["YES", "NO"]).then((number) => {
            if (number == 1) {
                // Delete the file
                this.fileApi.deleteFileEntry({'path': path, 'owner': null});
            }

        }).catch((error) => {
            console.error("Error during delete process", error);
        })
    }

    /**
	 * Function to show more details about an item
	 */
    showItem(photo): void {
        console.log("Show item", photo);

        this.navCtrl.push(DetailsPhotoPage, {
            parameters: photo
        });
    }


	/**
	 * Function to show a notification when the status in the blockchain has changed
	 */
    showNotification(status, name, id, icon): void {

        let text = ""
        if (status == "SENT") {
            text = "A new anchor is sent to the blockchain for " + name;
        } else if (status == "CONFIRMED") {
            text = "The anchor is confirmed for " + name;
        } else {
            return;
        }

        this.notif.schedule({
            id: id,
            text: text,
            title: "Anchor : New status"
        });
    }
    
	/**
	 * Basic function to convert a picture into a base64 URL
	 */
    convertImgToBase64URL(url, callback) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
        var canvas = <HTMLCanvasElement>document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        dataURL;
        canvas.height = (<HTMLImageElement>this).height;
        canvas.width = (<HTMLImageElement>this).width;
        ctx.drawImage(<HTMLImageElement>this, 0, 0);
        dataURL = canvas.toDataURL();
        callback(dataURL);
        canvas = null;
        };
        img.src = url;
        return url;
    }
}
