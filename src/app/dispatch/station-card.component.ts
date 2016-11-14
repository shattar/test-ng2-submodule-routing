import { Component, Input, SimpleChanges } from '@angular/core';
import { LoaderDispatchService, IJobs, IJob } from '../services';
import { Strings } from '../app.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'station-card',
    template: `
        <md-card>
            <md-card-subtitle>{{strings.values.dispatch?.stationCard?.cardSubtitle}}{{jobStatesSubtitle}}</md-card-subtitle>
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
                            <template [ngIf]="weight != null && weight !== ''">{{weight | number:1.0-1}}</template>
                        </template>
                    </datatable-column>
                    <datatable-column name="Age" prop="ready_time">
                        <template let-time="value">{{deltaMinutes(time)}}</template>
                    </datatable-column>
                </datatable>
            </md-card-content>
        </md-card>
  `
})
export class StationCardComponent {
    @Input() stationId: number;
    @Input() jobStates: string[];

    get jobStatesSubtitle() {
        if (this.jobStates != null && this.jobStates.length > 0) {
            return ': ' + this.jobStates.join(', ');
        }
    }

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

    constructor(
        private loaderDispatchService: LoaderDispatchService,
        private strings: Strings) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        let reinitStream: boolean = false;

        if ('jobStates' in changes) {
            reinitStream = true;
            console.log(JSON.stringify(this.jobStates));
        }

        if ('stationId' in changes) {
            reinitStream = true;
        }

        if (reinitStream) {
            if (this.zoneJobsSubscription) {
                this.zoneJobsSubscription.unsubscribe();
            }

            this.zoneJobsSubscription = this.loaderDispatchService.streamZoneJobs(this.stationId, this.jobStates)
                .subscribe((jobs: IJobs) => {
                    if (jobs) {
                        this.jobs = jobs.jobs;
                    } else {
                        this.jobs = [];
                    }
                });
        }
    }

    ngOnDestroy() {
        if (this.zoneJobsSubscription) {
            this.zoneJobsSubscription.unsubscribe();
        }
    }
}
