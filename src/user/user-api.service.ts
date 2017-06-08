import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Api, ZetaPushClient, createApi } from 'zetapush-angular';

// TODO Should be auto-generated
export class UserApi extends Api {

    onCreateUser: Observable<any>;

    createUser(login: string, password: string, fields: any) {
        return this.$publish('createUser', { login, password, fields });
    }
}

export function UserApiFactory(client: ZetaPushClient, zone: NgZone): UserApi {
    return createApi(client, zone, UserApi) as UserApi;
}

export const UserApiProvider = {
    provide: UserApi, useFactory: UserApiFactory, deps: [ ZetaPushClient, NgZone ]
};