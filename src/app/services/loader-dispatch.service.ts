import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
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
    first_scale_time?: string | Date;
    scale_id?: number;
    scale_code?: string;
    scale_gvw?: number;
    scale_time?: string | Date;
    ticket_number?: string;
}

export interface IJob {
    id?: number;
    rework_job_id?: number;
    state?: string;
    type?: string;
    ready_time?: string | Date;
    start_doing_time?: string | Date;
    stop_doing_time?: string | Date;
    start_check_out_time?: string | Date;
    done_time?: string | Date;
    done_reason?: string;
    zone_id?: number;
    zone_code?: string;
    zone_name?: string;
    site_id?: number;
    instructions?: IJobInstructions;
    results?: IJobResults;
}

export interface IJobs {
    jobs: IJob[];
}

@Injectable()
export class LoaderDispatchService {

    private _baseUrl: string = 'https://loader-dispatch-api.azurewebsites.net/v0/';

    constructor(private _http: Http) {
    }

    streamZoneJobs(zoneId: number): Observable<IJobs> {
        return this.getZoneJobs(zoneId)
            .repeatWhen(completed => {
                return completed.delay(10000);
            });
    }

    getZoneJobs(zoneId: number, maxRetries?: number): Observable<IJobs> {
        let url: string = this._baseUrl + 'zone/' + zoneId.toFixed(0) + '/jobs';
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
                    return <IJobs>(res.json());
                } catch (error) {
                    // If we got an empty response.
                    return null;
                }
            });
    }

    createJob(job: IJob, siteId?: number, maxRetries?: number): Observable<IJob> {
        let url: string = this._baseUrl + 'job';

        if (siteId != null) {
            job.site_id = siteId;
        }

        let headers = new Headers({
            'Content-Type': 'application/json'
        });

        let options = new RequestOptions({
            headers: headers,
            responseType: ResponseContentType.Json
        });

        return this._http.put(url, JSON.stringify(job), options)
            .timeout(5000, new Error('HTTP PUT Timeout: ' + url))
            .retryWhen(error => {
                // error is an Observable sequence of errors.
                // We want to return an Observable sequence of the same errors, delayed
                if (maxRetries == null) {
                    // Don't retry, just map it back to an error.
                    return error.map(err => {
                        throw err;
                    })
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

