import { Component } from '@angular/core';
import { JobManagerService, IJob } from '../services';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'detail-contents-2',
  template: `
    <pre>{{job$ | async | json}}</pre>
  `
})
export class DetailContents2Component {
  public job$: Observable<IJob>;
  constructor(private _jobManagerService: JobManagerService) {
    if (_jobManagerService) {
      console.log('Job manager service injected.');
      this.job$ = _jobManagerService.activeJob$;
      _jobManagerService.activeJobId = 1;
      setTimeout(() => {
        this._jobManagerService.activeJobId = 2;
      }, 15000);
      // this.job$ = jobManagerService.streamJob(1);
    }
  }

  ngOnInit() {
    console.log('hello `DetailContents2` component');
  }

}
