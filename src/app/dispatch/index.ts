import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MdProgressCircleModule, MdCardModule, MdInputModule, MdSidenavModule, MdListModule, MdToolbarModule, MdButtonModule } from '@angular/material';
import { Angular2DataTableModule } from 'angular2-data-table';

import { DispatchComponent } from './dispatch.component';
import { JobDetailsComponent } from './job-details.component';
import { StationViewComponent } from './station-view.component';
import { StationCardComponent } from './station-card.component';
import { JobFormComponent, NumericOnlyValidator } from './job-form.component';
import { CreateJobViewComponent } from './create-job-view.component';

// async components must be named routes for WebpackAsyncRoute
export const routes = [
  { path: '', pathMatch: 'full', redirectTo: 'site' },
  { path: 'site', pathMatch: 'full', component: DispatchComponent },
  {
    path: 'site/:siteId', component: DispatchComponent, // If pathMatch: 'full' was left here, it would block all child routes.
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'station' },
      { path: 'job-details', component: JobDetailsComponent },
      { path: 'create-job', component: CreateJobViewComponent },
      { path: 'station', pathMatch: 'full', component: StationViewComponent },
      { path: 'station/:stationId', component: StationViewComponent }
    ]
  }
];

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    DispatchComponent,
    JobDetailsComponent,
    StationViewComponent,
    StationCardComponent,
    JobFormComponent,
    NumericOnlyValidator,
    CreateJobViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MdProgressCircleModule,
    MdCardModule,
    MdInputModule,
    MdSidenavModule,
    MdListModule,
    MdToolbarModule,
    MdButtonModule,
    Angular2DataTableModule,
    RouterModule.forChild(routes),
  ]
})
export default class AboutModule {
  static routes = routes;
}
