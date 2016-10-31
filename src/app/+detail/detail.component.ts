import { Component } from '@angular/core';

@Component({
  selector: 'detail',
  template: `
    <h1>Hello from Detail</h1>
    <p>Here is an example of how to do child routing.</p>
    <a [routerLink]="['./det1']">det1</a> | <a [routerLink]="['./det2']">det2</a>
    <router-outlet></router-outlet>
  `
})
export class DetailComponent {
  constructor() {

  }

  ngOnInit() {
    console.log('hello `Detail` component');
  }

}
