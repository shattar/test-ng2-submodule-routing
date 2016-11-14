import { Injectable } from '@angular/core';

export type InternalStateType = {
  [key: string]: any
};

@Injectable()
export class AppState {
  _state: InternalStateType = { };

  constructor() {

  }

  // already return a clone of the current state
  get state() {
    return this._state = this._clone(this._state);
  }

  // never allow mutation
  set state(value) {
    throw new Error('do not mutate the `.state` directly');
  }


  get(prop: any) {
    // use our state getter for the clone
    return this._state.hasOwnProperty(prop) ? this._state[prop] : undefined;
  }

  set(prop: string, value: any) {
    // internally mutate our state
    return this._state[prop] = value;
  }


  private _clone(object: InternalStateType) {
    // simple object clone
    return JSON.parse(JSON.stringify( object ));
  }
}

interface IStrings {
  readonly languageCode: string;
  readonly values: {[key: string]: any}
}

@Injectable()
export class Strings {

  private _strings: IStrings = {
    languageCode: null,
    values: {
    }
  };

  get languageCode(): string {
    return this._strings.languageCode;
  }

  get values(): {[key: string]: any} {
    return this._strings.values;
  }

  constructor() {
    System.import('../assets/strings/en.json')
      .then(json => {
        this._strings = json;
      })
  }
}