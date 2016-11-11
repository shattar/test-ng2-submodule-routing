import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'station-view',
  styles: [`
    :host /deep/ md-card {
      margin: 8px;
    }
  `],
  template: `
      <station-card [stationId]="stationId"></station-card>
  `
})
export class StationViewComponent {

    public stationId: number;

    private _parameterSubscription: Subscription;

    constructor(private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this._parameterSubscription = this._route.params.subscribe((params: Params) => {
            this.stationId = +params['zoneId'];
            // console.log(params);
        })
    }

    ngOnDestroy() {
        this._parameterSubscription.unsubscribe();
    }
}
