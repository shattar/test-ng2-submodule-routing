import { Component, ViewEncapsulation } from '@angular/core';
import * as ngDataTableStyles from 'angular2-data-table/release/datatable.css';
import * as ngDataTableMaterialStyles from 'angular2-data-table/release/material.css';

@Component({
  selector: 'detail',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    ngDataTableStyles,
    ngDataTableMaterialStyles
  ],
  template: `
    <md-toolbar color="primary">
      <span>Loader Dispatchy Views</span>
    </md-toolbar>
    <md-sidenav-layout>
      <md-sidenav align="end" mode="side" opened=true>
        <md-nav-list>
          <a md-list-item [routerLink]="['./det1']">det1</a>
          <a md-list-item [routerLink]="['./det2']">det2</a>
          <a md-list-item [routerLink]="['./zone/1']">det3</a>
        </md-nav-list>
      </md-sidenav>
      <router-outlet></router-outlet>
    </md-sidenav-layout>
  `
})
export class DetailComponent {
  constructor() {
  }

  ngOnInit() {
    console.log('hello `Detail` component');
  }

}
