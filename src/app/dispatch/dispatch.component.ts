import { Component, ViewEncapsulation } from '@angular/core';
import { Strings } from '../app.service';
import * as mdTheme from '@angular/material/core/theming/prebuilt/indigo-pink.css';
import * as ngDataTableStyles from 'angular2-data-table/release/datatable.css';
import * as ngDataTableMaterialStyles from 'angular2-data-table/release/material.css';

@Component({
  selector: 'dispatch',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    mdTheme,
    ngDataTableStyles,
    ngDataTableMaterialStyles
  ],
  template: `
    <md-toolbar color="primary">
      <span>{{strings.values.dispatch?.title}}</span>
    </md-toolbar>
    <md-sidenav-layout>
      <md-sidenav align="end" mode="side" opened=true>
        <md-nav-list>
          <a md-list-item [routerLink]="['./create-job']">{{strings.values.dispatch?.jobSubmission?.linkTitle}}</a>
          <a md-list-item [routerLink]="['./zone/1', {jobStates: ['to-check-out', 'checking-out', 'done']}]">{{strings.values.dispatch?.stationCard?.linkTitle}}</a>
          <a md-list-item [routerLink]="['./zone/1', {jobStates: ['to-do', 'doing']}]">{{strings.values.dispatch?.stationCard?.linkTitle}}</a>
        </md-nav-list>
      </md-sidenav>
      <router-outlet></router-outlet>
    </md-sidenav-layout>
  `
})
export class DispatchComponent {
  constructor(private strings: Strings) {
  }

  ngOnInit() {
    console.log('hello `Dispatch` component');
    console.log(this.strings);
  }

}
