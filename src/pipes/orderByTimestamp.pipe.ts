import { Pipe, PipeTransform } from '@angular/core';
import { BeaconDetection } from '../beacon-detection/beacon-api.service';

@Pipe({
    name: 'orderByTimestamp'
})

export class OrderByTimestampPipe implements PipeTransform {
    transform(array: Array<BeaconDetection>, args: number): Array<BeaconDetection> {

        if(!array || array === undefined || array.length === 0) return null;

        array.sort((a: any, b: any) => {
            if (a.timestamp < b.timestamp){
                return 1;
            } else if ( a.timestamp > b.timestamp) {
                return -1;
            } else {
                return 0;
            }
        });
        return array;
    }
}
