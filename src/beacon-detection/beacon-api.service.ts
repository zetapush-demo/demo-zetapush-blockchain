import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Api, ZetaPushClient, createApi } from 'zetapush-angular';

export interface BeaconDetection {
	data: string;
	device: string;
	timestamp: number;
	distance: number;
    statut: string;
    description: string;
}

export interface BeaconDescription {
    data: string;
    description: string;
}

// TODO Should be auto-generated
export class BeaconApi extends Api {
    onNewBeaconDetection: Observable<BeaconDetection>;
    onGetAllBeaconDetections: Observable<Array<BeaconDetection>>;
    onDeleteBeaconDetection: Observable<string>;
    onUpdateDescription: Observable<any>;
    onListBeaconDescriptions: Observable<any>;

    newBeaconDetection({ timestamp, data, distance, device, statut, description }: BeaconDetection) {
        return this.$publish('newBeaconDetection', { timestamp, data, distance, device, statut, description});
    }

    getAllBeaconDetections() {
        return this.$publish('getAllBeaconDetections', {});
    }

    deleteBeaconDetection(timestamp: string): Promise<string> {
        return this.$publish('deleteBeaconDetection', { timestamp });
    }

    updateDescription(beacon: string, description: string): Promise<any>{
        return this.$publish('updateDescription', { beacon, description });
    }

    listBeaconDescriptions(): Promise<any>{
        return this.$publish('listBeaconDescriptions', {} );
    }
}

export function BeaconApiFactory(client: ZetaPushClient, zone: NgZone): BeaconApi {
    return createApi(client, zone, BeaconApi) as BeaconApi;
}

export const BeaconApiProvider = {
    provide: BeaconApi, useFactory: BeaconApiFactory, deps: [ ZetaPushClient, NgZone ]
};