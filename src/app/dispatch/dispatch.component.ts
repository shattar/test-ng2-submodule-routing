import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AppState, Strings } from '../app.service';
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
      <span>{{_strings.values.dispatch?.title}}</span>
    </md-toolbar>
    <md-sidenav-layout>
      <md-sidenav align="end" mode="side" opened=true>
        <md-nav-list>
          <a md-list-item
            [routerLink]="['./create-job']">
            {{_strings.values.dispatch?.jobSubmission?.linkTitle}}
          </a>
          <a md-list-item
            [routerLink]="['./station']"
            [queryParams]="{ jobStates: ['to-do', 'doing'] }">
            {{_strings.values.dispatch?.stationCard?.linkTitle}}
          </a>
          <a md-list-item
            [routerLink]="['./station']"
            [queryParams]="{ jobStates: ['to-check-out', 'checking-out', 'done'] }">
            {{_strings.values.dispatch?.stationCard?.linkTitle}}
          </a>
        </md-nav-list>
      </md-sidenav>
      <router-outlet></router-outlet>
    </md-sidenav-layout>
  `
})
export class DispatchComponent {

  private _parameterSubscription: Subscription;

  constructor(
    private _appState: AppState,
    private _strings: Strings,
    private _route: ActivatedRoute,
    router: Router) {

    if (_route.snapshot.params['siteId'] == null) {
      let id = _appState.get('siteId');
      if (id == null) {
        id = '1';
      } else {
        id = id.toFixed(0);
      }
      router.navigate([id], {
        relativeTo: _route,
        preserveQueryParams: true,
        replaceUrl: true
      });
    }
  }

  ngOnInit() {
    this._parameterSubscription = this._route.params.subscribe((params: Params) => {
      let siteId = +params['siteId'];
      this._appState.set('siteId', siteId);
    })
  }

  ngOnDestroy() {
    this._parameterSubscription.unsubscribe();
  }

}
