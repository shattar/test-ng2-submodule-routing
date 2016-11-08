import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JobManagerService, IJob } from '../services';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'detail-contents-2',
  styles: [`
    :host /deep/ md-card {
      margin: 8px;
    }
  `],
  template: `
      <job-form></job-form>
      <md-card>
        <md-card-subtitle>Active Job</md-card-subtitle>
        <md-card-title>Job #{{jobId.value}}</md-card-title>
        <md-card-content>
          <md-input #jobId name="jobId" placeholder="Job Id" (keyup.enter)="jobIdInput(jobId.value)" (blur)="jobIdInput(jobId.value)">
            <md-hint align="end" *ngIf="_jobIdInvalid">Must be an integer!</md-hint>
          </md-input>
          <pre>{{job$ | async | json}}</pre>
        </md-card-content>
      </md-card>
      <station-view [stationId]="1"></station-view>
  `
})
export class DetailContents2Component {
  public job$: Observable<IJob>;
  private _jobIdInvalid: boolean = true;
  private _parameterSubscription: Subscription;
  constructor(private _jobManagerService: JobManagerService,
              private _route: ActivatedRoute) {
    if (_jobManagerService) {
      console.log('Job manager service injected.');
      this.job$ = _jobManagerService.activeJob$;
    }
          // <p>{{jobId.value}}</p>

  }

  ngOnInit() {
    console.log('hello `DetailContents2` component');
    this._parameterSubscription = this._route.params.subscribe((params: Params) => {
      console.log(params);
      this.jobIdInput(params['zoneId']);
    })
  }

  ngOnDestroy() {
    this._parameterSubscription.unsubscribe();
  }

  jobIdInput(jobId: string) {
    let id = +jobId;
    if (Number.isSafeInteger(id)) {
      this._jobManagerService.activeJobId = id;
      this._jobIdInvalid = false;
    } else {
      this._jobManagerService.activeJobId = null;
      this._jobIdInvalid = true;
    }
  }

}
