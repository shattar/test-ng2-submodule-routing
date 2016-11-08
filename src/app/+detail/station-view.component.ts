import { Component, Input } from '@angular/core';
import { LoaderDispatchService, IJobs, IJob } from '../services';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'station-view',
    template: `
        <md-card>
            <md-card-subtitle>Station Truck List</md-card-subtitle>
            <md-card-title>Station #{{stationId}}</md-card-title>
            <md-card-content>
                <datatable 
                    class="material"
                    [rows]="jobs"
                    columnMode="'force'"
                    headerHeight="50"
                    footerHeight="50"
                    rowHeight="'auto'">
                    <datatable-column name="Id" width="50"></datatable-column>
                    <datatable-column name="State" width="100"></datatable-column>
                    <datatable-column name="Loader Id" prop="results.loader_id"></datatable-column>
                    <datatable-column name="Truck Id" prop="instructions.truck_id"></datatable-column>
                    <datatable-column name="Material Id" prop="instructions.material_id"></datatable-column>
                    <datatable-column name="Target Weight" prop="instructions.target_material_weight">
                        <template let-weight="value">
                        {{weight | number:1.0-1}}
                        </template>
                    </datatable-column>
                    <datatable-column name="Age" prop="ready_time">
                        <template let-time="value">
                        {{deltaMinutes(time)}}
                        </template>
                    </datatable-column>
                </datatable>
            </md-card-content>
        </md-card>
  `
})
export class StationViewComponent {
    private _stationId: number;

    deltaMinutes(dateString: string): string {
        let deltaTms = Date.now() - Date.parse(dateString);
        if (Number.isFinite(deltaTms)) {
            let deltaTMin = deltaTms / (1000.0 * 60.0);
            if (deltaTMin >= 1441.0) {
                return Math.trunc(deltaTMin / 1440.0).toFixed() + ' days';
            } else if (deltaTMin >= 61.0) {
                return Math.trunc(deltaTMin / 60.0).toFixed() + ' hours';
            } else {
                return Math.trunc(deltaTMin).toFixed() + ' min';
            }
        } else {
            return '-';
        }
    }

    zoneJobsSubscription: Subscription;
    jobs: IJob[] = [];

    @Input() set stationId(stationId: number) {
        if (this._stationId !== stationId) {
            if (this.zoneJobsSubscription) {
                this.zoneJobsSubscription.unsubscribe();
            }
            this._stationId = stationId;
            this.zoneJobsSubscription = this.loaderDispatchService.streamZoneJobs(stationId)
                .subscribe((jobs: IJobs) => {
                    if (jobs) {
                        this.jobs = jobs.jobs;
                    } else {
                        this.jobs = [];
                    }
                });
        }
    }

    get stationId(): number {
        return this._stationId;
    }

    constructor(public loaderDispatchService: LoaderDispatchService) {
    }

    ngOnInit() {
        console.log('hello `station-view` component');
    }

    ngOnDestroy() {
        if (this.zoneJobsSubscription) {
            this.zoneJobsSubscription.unsubscribe();
        }
    }
}
