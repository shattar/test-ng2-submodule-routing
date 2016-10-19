import { Component } from '@angular/core';

@Component({
  selector: 'detail-contents-2',
  template: `
    <h2>Detail contents 2.</h2>
  `
})
export class DetailContents2Component {
  constructor() {

  }

  ngOnInit() {
    console.log('hello `DetailContents2` component');
  }

}
