import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../app.service';

@Component({
  selector: 'station-view',
  styles: [`
    :host /deep/ md-card {
      margin: 8px;
    }
  `],
  template: `
      <station-card [stationId]="stationId" [jobStates]="jobStates"></station-card>
  `
})
export class StationViewComponent {

    public stationId: number;
    public jobStates: string[];

    private _parameterSubscription: Subscription;
    private _queryParameterSubscription: Subscription;

    constructor(
        private _appState: AppState,
        private _route: ActivatedRoute,
        _router: Router) {

        if (_route.snapshot.params['stationId'] == null) {
            let id = _appState.get('stationId');
            if (id == null) {
                id = '1';
            } else {
                id = id.toFixed(0);
            }
            _router.navigate([id], {
                relativeTo: _route,
                preserveQueryParams: true,
                replaceUrl: true
            });
        }
    }

    ngOnInit() {
        this._parameterSubscription = this._route.params.subscribe((params: Params) => {
            this.stationId = +params['stationId'];
            this._appState.set('stationId', this.stationId);
            // console.log(params);
        });
        this._queryParameterSubscription = this._route.queryParams.subscribe((params: Params) => {
            this.jobStates = params['jobStates'].split(',');
            // console.log(params);
        });
    }

    ngOnDestroy() {
        this._parameterSubscription.unsubscribe();
        this._queryParameterSubscription.unsubscribe();
    }
}
