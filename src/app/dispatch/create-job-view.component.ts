import { Component } from '@angular/core';
import { ActivatedRoute, Params, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/merge';

// This traverses the route, following ancestors, looking for the parameter.
function getParam(route: ActivatedRouteSnapshot, key: string): any {
    if (route != null) {
        let param = route.params[key];
        if (param === undefined) {
            return getParam(route.parent, key);
        } else {
            return param;
        }
    } else {
        return undefined;
    }
}

@Component({
  selector: 'create-job-view',
  styles: [`
    :host /deep/ md-card {
      margin: 8px;
    }
  `],
  template: `
      <job-form [siteId]="siteId"></job-form>
  `
})
export class CreateJobViewComponent {

    public siteId: number;

    private _parameterSubscription: Subscription;

    constructor(private _route: ActivatedRoute) {
    }

    ngOnInit() {
        // This just gets it on init, not really needed if observable is used.
        this.siteId = +getParam(this._route.snapshot, 'siteId');

        // This gets it when any parameter on the route changes.
        let paramObservables: Observable<Params>[] = this._route.pathFromRoot.map(route => route.params);
        this._parameterSubscription = Observable.merge(...paramObservables).subscribe((params: Params) => {
            if ('siteId' in params) {
                // If there are ancestor routes that have used the same parameter name, they will conflict!
                this.siteId = +params['siteId'];
            }
        });
    }

    ngOnDestroy() {
        this._parameterSubscription.unsubscribe();
    }
}
