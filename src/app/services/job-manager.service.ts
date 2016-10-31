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

export interface IJobInstructions {
    description?: string;
    truck_id?: number;
    truck_code?: string;
    truck_name?: string;
    material_id?: number;
    material_code?: string;
    material_name?: string;
    target_material_weight?: number;
}

export interface IJobResults {
    loader_id?: number;
    loader_code?: string;
    loader_pass_count?: number;
    loader_material_weight?: number;
    first_scale_id?: number;
    first_scale_code?: string;
    first_scale_gvw?: number;
    first_scale_time?: string;
    scale_id?: number;
    scale_code?: string;
    scale_gvw?: number;
    scale_time?: string;
    ticket_number?: string;
}

export interface IJob {
    id: number;
    rework_job_id?: number;
    state?: string;
    type?: string;
    ready_time?: string;
    start_doing_time?: string;
    stop_doing_time?: string;
    start_check_out_time?: string;
    done_time?: string;
    done_reason?: string;
    zone_id?: number;
    zone_code?: string;
    zone_name?: string;
    site_id?: number;
    instructions?: IJobInstructions;
    results?: IJobResults;
}

// class ActiveJob extends BehaviorSubject<IJob> {
//     private _jobStreamSubscription: Subscription;

//     constructor() {
//         super({id: null});
//     }

//     set jobStream(jobStream: Observable<IJob>) {
//         if (this._jobStreamSubscription) {
//             this._jobStreamSubscription.unsubscribe();
//         }

//         if (jobStream) {
//             this._jobStreamSubscription = jobStream.subscribe(this);
//         }
//     }
// }

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

    set activeJobId(jobId: number | null) {
        if (jobId == null) {
            if (this._activeJobId != null) {
                // Stop the current observable
                this._activeJobStream$ = NeverObservable.create<IJob>();
                this._activeJobId = null;
            }
        } else if (jobId !== this._activeJobId) {
            this._activeJobStream$ = this.streamJob(jobId);
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
                console.log('Received Response.');
                return <IJob>res.json();
            });
    }
}

