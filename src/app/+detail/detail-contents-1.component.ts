import { Component } from '@angular/core';

@Component({
  selector: 'detail-contents-1',
  template: `
    <h2>Detail contents 1.</h2>
    <md-spinner></md-spinner>
  `
})
export class DetailContents1Component {
  constructor() {

  }

  ngOnInit() {
    console.log('hello `DetailContents1` component');
  }

}
