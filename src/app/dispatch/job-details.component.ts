import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JobManagerService, IJob } from '../services';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'job-details',
  styles: [`
    :host /deep/ md-card {
      margin: 8px;
    }
  `],
  template: `
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
  `
})
export class JobDetailsComponent {
  public job$: Observable<IJob>;
  private _jobIdInvalid: boolean = true;
  private _parameterSubscription: Subscription;
  constructor(private _jobManagerService: JobManagerService,
              private _route: ActivatedRoute) {
    if (_jobManagerService) {
      this.job$ = _jobManagerService.activeJob$;
    }
  }

  ngOnInit() {
    this._parameterSubscription = this._route.params.subscribe((params: Params) => {
      console.log(params);
      this.jobIdInput(params['jobId']);
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
