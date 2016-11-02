import { Component, Input, SimpleChanges } from '@angular/core';
import { LoaderDispatchService, IJobs, IJob } from '../services';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'station-view',
    template: `
        <md-card>
            <md-card-subtitle>Station Truck List</md-card-subtitle>
            <md-card-title>Station #{{stationId}}</md-card-title>
            <md-card-content *ngIf="jobs">
                <template ngFor let-job [ngForOf]="jobs">
                    <pre>{{job | json}}</pre>
                </template>
            </md-card-content>
        </md-card>
  `
})
export class StationViewComponent {
    @Input() stationId: number;
    zoneJobsSubscription: Subscription;
    jobs: IJob[];

    constructor(public loaderDispatchService: LoaderDispatchService) {
    }

    ngOnInit() {
        console.log('hello `station-view` component');
    }

    ngOnChanges(changes: SimpleChanges) {
        if ('stationId' in changes) {
            let change = changes['stationId'];
            if (this.zoneJobsSubscription) {
                this.zoneJobsSubscription.unsubscribe();
            }

            this.zoneJobsSubscription = this.loaderDispatchService.streamZoneJobs(change.currentValue).subscribe(
                (jobs: IJobs) => {
                    if (jobs) {
                        this.jobs = jobs.jobs;
                    } else {
                        this.jobs = null;
                    }
                }
            )
        }
    }

    ngOnDestroy() {
        if (this.zoneJobsSubscription) {
            this.zoneJobsSubscription.unsubscribe();
        }
    }
}
