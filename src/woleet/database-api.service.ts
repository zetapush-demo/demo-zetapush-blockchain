import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Api, ZetaPushClient, createApi } from 'zetapush-angular';


export class DatabaseApi extends Api {

    onGetAnchorId: Observable<string>;
    onAddNewAnchorId: Observable<any>;
    onRemoveAnchorId: Observable<any>

    getAnchorId(name: string): Promise<string> {
        return this.$publish('getAnchorId', { name });
    }

    addNewAnchorId(name: string, anchorId: string): Promise<any> {
        return this.$publish('addNewAnchorId', { name, anchorId });
    }

    removeAnchorId(name: string): Promise<any> {
        return this.$publish('removeAnchorId', { name });
    }

}

export function DatabaseApiFactory(client: ZetaPushClient, zone: NgZone): DatabaseApi {
    return createApi(client, zone, DatabaseApi) as DatabaseApi;
}

export const DatabaseApiProvider = {
    provide: DatabaseApi, useFactory: DatabaseApiFactory, deps: [ ZetaPushClient, NgZone ]
};