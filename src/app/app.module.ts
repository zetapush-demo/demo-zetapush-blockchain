import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, LoadingController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { PhotoPage } from '../pages/photo/photo';
import { BeaconPage } from '../pages/beacon/beacon';
import { DetailsPhotoPage } from '../pages/detailsPhoto/detailsPhoto';
import { DetailsBeaconPage } from '../pages/detailsBeacon/detailsBeacon';
import { SettingsPage } from '../pages/settings/settings';

import { ZetaPushClientConfig, ZetaPushModule } from 'zetapush-angular';
import { UserApiProvider } from '../user/user-api.service';
import { FileApiProvider } from '../file/file-api.service';
import { FileUpload } from '../file/file-upload.service';
import { BeaconApiProvider } from '../beacon-detection/beacon-api.service';
import { BeaconDetectionService } from '../beacon-detection/beacon-detection.service';

import { Dialogs } from '@ionic-native/dialogs';
import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { WoleetApiProvider } from '../woleet/woleet-api.service';
import { DatabaseApiProvider } from '../woleet/database-api.service';
import { Device } from '@ionic-native/device';

import { OrderByTimestampPipe } from '../pipes/orderByTimestamp.pipe';

import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { Toast } from '@ionic-native/toast';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    PhotoPage,
    BeaconPage,
    DetailsPhotoPage,
    DetailsBeaconPage,
    SettingsPage,
    OrderByTimestampPipe
  ],
  imports: [
    BrowserModule,
    ZetaPushModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    PhotoPage,
    BeaconPage,
    DetailsPhotoPage,
    DetailsBeaconPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: ZetaPushClientConfig, useValue: { sandboxId: '<sandboxId>' }},
    UserApiProvider,
    Dialogs,
    FileApiProvider,
    FileUpload,
    Camera,
    LoadingController,
    Geolocation,
    LocalNotifications,
    WoleetApiProvider,
    DatabaseApiProvider,
    BeaconApiProvider,
    Device,
    BeaconDetectionService,
    File,
    Transfer,
    FileOpener,
    FileChooser,
    FilePath,
    Toast
  ]
})
export class AppModule {}
