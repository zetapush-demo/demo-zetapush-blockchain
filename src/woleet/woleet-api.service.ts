import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Api, ZetaPushClient, createApi } from 'zetapush-angular';

export interface Anchor {
    id: string;
    created: string;
    lastModified: string;
    name: string;
    hash: string;
    signedHash: string;
    pubKey: string;
    signature: string;
    identityURL: string;
    public_: boolean;
    tags: Array<string>;
    metadata: any;
    callbackURL: string;
    status: string;
    timestamp: string;
    confirmations: number;
    txId: string;
}

export interface Receipt {
    header: string;
    target: Target;
    signature: Signature;
    extra: any;
}

export interface Signature {
    signedHash: string;
    pubKey: string;
    signature: string;
    identityURL: string;
}

export interface Target_proof {
    left: string;
    parent: string;
    right: string;
}

export interface Target {
    target_hash: string;
    target_proof: Target_proof;
}

export interface Header {
    chainpoint_version: string;
    hash_type: string;
    merkle_root: string;
    tx_id: string;
    timestamp: number;
}


export class WoleetApi extends Api {

    onListAnchors: Observable<Array<Anchor>>;
    onCreateAnchor: Observable<any>;
    onUpdateAnchor: Observable<any>;
    onDeleteAnchor: Observable<any>;
    onGetAnchor: Observable<Anchor>;
    onGetReceipt: Observable<Receipt>;
    onVerifyReceipt: Observable<any>;
    onDispatch: Observable<any>;
    onUpdateStatus: Observable<any>;
    onUpdateStatusBeacon: Observable<any>;
    onDispatchBeacon: Observable<any>;

    
    listAnchors(): Promise<any>{
        return this.$publish('listAnchors', {});
    }

    createAnchor(anchor: Anchor): Promise<any> {
        return this.$publish('createAnchor', { anchor});
    }

    updateAnchor(anchorId: string, anchor: Anchor): Promise<any> {
        return this.$publish('updateAnchor', { anchorId, anchor });
    }

    deleteAnchor(anchorId: string): Promise<any> {
        return this.$publish('deleteAnchor', { anchorId });
    }

    getAnchor(anchorId: string): Promise<Anchor> {
        return this.$publish('getAnchor', { anchorId });
    }

    getReceipt(anchorId: string): Promise<Receipt> {
        return this.$publish('getReceipt', { anchorId });
    }

    verifyReceipt(receipt: Receipt): Promise<any> {
        return this.$publish('verifyReceipt', { receipt });
    }

    dispatch(anchor: Anchor): Promise<any> {
        return this.$publish('dispatch', { anchor });
    }

    updateStatus(path: string, value: string): Promise<any> {
        return this.$publish('updateStatus', { path, value });
    }

    updateStatusBeacon(timestamp: string, data: string, value: string): Promise<any> {
        return this.$publish('updateStatusBeacon', { timestamp, data, value });
    }

    dispatchBeacon(anchor: Anchor): Promise<any> {
        return this.$publish('dispatchBeacon', { anchor });
    }



}

export function WoleetApiFactory(client: ZetaPushClient, zone: NgZone): WoleetApi {
    return createApi(client, zone, WoleetApi) as WoleetApi;
}

export const WoleetApiProvider = {
    provide: WoleetApi, useFactory: WoleetApiFactory, deps: [ ZetaPushClient, NgZone ]
};