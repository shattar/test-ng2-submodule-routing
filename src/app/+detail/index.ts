import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MdProgressCircleModule, MdCardModule, MdInputModule, MdSidenavModule, MdListModule, MdToolbarModule } from '@angular/material';
import { Angular2DataTableModule } from 'angular2-data-table';

import { DetailComponent } from './detail.component';
import { DetailContents1Component } from './detail-contents-1.component';
import { DetailContents2Component } from './detail-contents-2.component';
import { StationViewComponent } from './station-view.component';

console.log('`Detail` bundle loaded asynchronously');
// async components must be named routes for WebpackAsyncRoute
export const routes = [
  { path: '', component: DetailComponent, // If pathMatch: 'full' was left here, it would block all child routes.
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'det1' },
      { path: 'det1', component: DetailContents1Component },
      { path: 'det2', component: DetailContents2Component },
      { path: 'zone/:zoneId', component: DetailContents2Component }
    ]
  }
];

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    DetailComponent,
    DetailContents1Component,
    DetailContents2Component,
    StationViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MdProgressCircleModule,
    MdCardModule,
    MdInputModule,
    MdSidenavModule,
    MdListModule,
    MdToolbarModule,
    Angular2DataTableModule,
    RouterModule.forChild(routes),
  ]
})
export default class AboutModule {
  static routes = routes;
}
