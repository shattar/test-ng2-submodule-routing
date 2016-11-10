import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { NeverObservable } from 'rxjs/observable/NeverObservable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concat';

import { IJob } from './loader-dispatch.service';

@Injectable()
export class JobManagerService {

    private _baseUrl: string = 'https://loader-dispatch-api.azurewebsites.net/v0/';

    private _activeJobId: number = null;
    private _activeJobStream$: Observable<IJob> = new NeverObservable<IJob>();

    private _activeJobStreamSubscriber: Subscriber<Observable<IJob>>;

    private _activeJobSubject$: Observable<IJob>;

    constructor(private _http: Http) {
        // The idea here is that we can 'next' the stream when a new job id is set.
        // this can be merged into a level 1 observable with 'switch'.
        // this can then be multicast with a BehaviorSubject (publishBehavior) then refCounted.
        this._activeJobSubject$ = new Observable<Observable<IJob>>(subscriber => {
            console.log('Start the polling.');
            this._activeJobStreamSubscriber = subscriber;
            if (this._activeJobStream$) {
                subscriber.next(this._activeJobStream$);
            }
            return (() => {
                console.log('Cancel the polling.');
                this._activeJobStreamSubscriber = null;
            });
        }).switch()
            .multicast(new BehaviorSubject<IJob>(null))
            .refCount();
    }

    get activeJob$(): Observable<IJob> {
        return this._activeJobSubject$;
    }

    get activeJobId(): number {
        return this._activeJobId;
    }

    set activeJobId(jobId: number | null) {
        if (jobId == null) {
            if (this._activeJobId != null) {
                // Stop the current observable
                this._activeJobStream$ = Observable.of(null);
                this._activeJobId = null;
            }
        } else if (jobId !== this._activeJobId) {
            this._activeJobStream$ = Observable.of(null).concat(this.streamJob(jobId));
            this._activeJobId = jobId;
        }

        if (this._activeJobStreamSubscriber) {
            this._activeJobStreamSubscriber.next(this._activeJobStream$);
        }
    }

    streamJob(jobId: number): Observable<IJob> {
        return this.getJob(jobId)
            .repeatWhen(completed => {
                return completed.delay(10000).do(val => { console.log('Repeat Request.') });
            });
    }

    getJob(jobId: number, maxRetries?: number): Observable<IJob> {
        let url: string = this._baseUrl + 'job/' + jobId.toFixed(0);
        return this._http.get(url)
            .timeout(5000, new Error('HTTP GET Timeout: ' + url))
            .retryWhen(error => {
                // error is an Observable sequence of errors.
                // We want to return an Observable sequence of the same errors, delayed
                if (maxRetries == null) {
                    return error.delay(5000);
                } else {
                    return error.delay(5000).scan((errorCount, err) => {
                        if (errorCount >= maxRetries) {
                            throw err;
                        }
                        return errorCount + 1;
                    }, 0);
                }
            })
            .map(res => {
                try {
                    return <IJob>(res.json());
                } catch (error) {
                    // If we got an empty response.
                    return null;
                }
            });
    }
}

