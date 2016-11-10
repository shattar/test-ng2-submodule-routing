import { Directive, Component, Input, ViewChild, forwardRef, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NG_VALIDATORS, Validator, AbstractControl, FormGroupDirective } from '@angular/forms'
import { LoaderDispatchService, IJobs, IJob } from '../services';
import { Subscription } from 'rxjs/Subscription';

const NUMERIC_ONLY_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => NumericOnlyValidator),
  multi: true
};

@Directive({
  selector: '[numericOnly][formControlName],[numericOnly][formControl],[numericOnly][ngModel]',
  providers: [NUMERIC_ONLY_VALIDATOR],
  host: {
    // Put the 'corrected' attribute value back in
    '[attr.numericOnly]': 'numericOnly ? "" : null',
    // Could register for host (keypress) event here and enforce this constraint
    //   '(keypress)': 'block($event)'
  }
})
export class NumericOnlyValidator implements Validator {
  private _numericOnly: boolean;
  private _onChange: () => void;

  @Input()
  get numericOnly(): boolean { return this._numericOnly; }

  set numericOnly(value: boolean) {
    this._numericOnly = value != null && `${value}` !== 'false';
    if (this._onChange) this._onChange();
  }

  validate(c: AbstractControl): {[key: string]: any} {
    let value: string = c.value;
    return (value === '' || Number.isFinite(Number(value))) ? null : {'numericOnly': true}; 
  }

//   block($event: KeyboardEvent) {
//     if (this.numericOnly) {
//       if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'].indexOf($event.key) === -1) {
//         $event.preventDefault();
//       }
//     }
//   }

  registerOnValidatorChange(fn: () => void) { this._onChange = fn; }
}

@Component({
    selector: 'job-form',
    styles: [`
        .col-layout {
            display: flex;
            flex-flow: column nowrap;
            justify-content: flex-start;
            align-items: flex-start;
            align-content: flex-start;
        }
        .row-layout {
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-start;
            align-items: flex-start;
            align-content: flex-start;
        }
        .row-layout-centered {
            display: flex;
            flex-flow: row nowrap;
            justify-content: center;
            align-items: flex-start;
            align-content: flex-start;
        }
        .spacer {
            height: 0.75em;
            background: transparent;
        }
        [hidden] {
            // Override the normal specificity of hidden and make it !important.
            display: none !important;
        }
    `],
    template: `
        <form #form="ngForm" [formGroup]="jobForm" (ngSubmit)="submitForm()" novalidate>
            <md-card *ngIf="!form.submitted">
                <md-card-subtitle>Job Submission Form</md-card-subtitle>
                <md-card-title>Site #{{siteId}}</md-card-title>
                <md-card-content>
                    <div class="col-layout">
                        <div class="row-layout">
                            <md-input placeholder="Truck Code" formControlName="truckCode" autofocus required
                                      [dividerColor]="jobForm.controls.truckCode.invalid ? 'warn' : 'primary'">
                                <md-hint *ngIf="jobForm.controls.truckCode.invalid" align="end">
                                    <template [ngIf]="jobForm.controls.truckCode.errors.required">
                                        Required
                                    </template>
                                </md-hint>
                            </md-input>
                        </div>
                        <div class="spacer"><!-- Gives proper separation between inputs (previous hint doesn't run into next label) --></div>
                        <div class="row-layout">
                            <md-input placeholder="Zone Code" formControlName="zoneCode" required
                                      [dividerColor]="jobForm.controls.zoneCode.invalid ? 'warn' : 'primary'">
                                <md-hint *ngIf="jobForm.controls.zoneCode.invalid" align="end">
                                    <template [ngIf]="jobForm.controls.zoneCode.errors.required">
                                        Required
                                    </template>
                                </md-hint>
                            </md-input>
                        </div>
                        <div class="spacer"><!-- Gives proper separation between inputs (previous hint doesn't run into next label) --></div>
                        <div class="row-layout">
                            <md-input placeholder="Material Code" formControlName="materialCode"
                                      [dividerColor]="jobForm.controls.materialCode.invalid ? 'warn' : 'primary'">
                            </md-input>
                        </div>
                        <div class="spacer"><!-- Gives proper separation between inputs (previous hint doesn't run into next label) --></div>
                        <div class="row-layout">
                            <md-input placeholder="Target Weight" formControlName="targetWeight" required numericOnly
                                      [dividerColor]="jobForm.controls.targetWeight.invalid ? 'warn' : 'primary'">
                                <span md-suffix>&nbsp;tonnes</span>
                                <md-hint *ngIf="jobForm.controls.targetWeight.invalid" align="end">
                                    <template [ngIf]="jobForm.controls.targetWeight.errors.numericOnly">
                                        Numeric Only
                                    </template>
                                    <template [ngIf]="jobForm.controls.targetWeight.errors.required">
                                        Required
                                    </template>
                                </md-hint>
                            </md-input>
                        </div>
                    </div>
                    <pre>{{jobForm.valueChanges | async | json}}</pre>
                </md-card-content>
                <md-card-actions align="end">
                    <button md-button type="reset">RESET</button>
                    <button md-button color="primary" [disabled]="jobForm.invalid" type="submit">SUBMIT</button>
                </md-card-actions>
            </md-card>
            <md-card *ngIf="form.submitted && !busy && lastSubmitError == null">
                <md-card-subtitle>Job Submission Form</md-card-subtitle>
                <md-card-title>Submitted</md-card-title>
                <md-card-content>
                    <pre>{{lastSubmitResult | json}}</pre>
                </md-card-content>
                <md-card-actions align="end">
                    <button md-button type="reset">NEW JOB</button>
                </md-card-actions>
            </md-card>
            <md-card *ngIf="form.submitted && !busy && lastSubmitError != null">
                <md-card-subtitle>Job Submission Form</md-card-subtitle>
                <md-card-title>Error</md-card-title>
                <md-card-content>
                    <pre>{{lastSubmitError | json}}</pre>
                </md-card-content>
                <md-card-actions align="end">
                    <button md-button type="button" (click)="tryAgain()">TRY AGAIN</button>
                </md-card-actions>
            </md-card>
            <md-card *ngIf="form.submitted && busy">
                <md-card-subtitle>Job Submission Form</md-card-subtitle>
                <md-card-title>Please Wait...</md-card-title>
                <md-card-content>
                    <div class="row-layout-centered">
                        <md-spinner></md-spinner>
                    </div>
                </md-card-content>
            </md-card>
        </form>
    `
})
export class JobFormComponent {
    @Input() siteId: number = 1;

    private jobForm: FormGroup;

    private lastFormValue: { [key: string]: any };

    private lastSubmitResult: IJob;
    private lastSubmitError: any;

    private busy: boolean = false;

    @ViewChild('form') private formGroupDirective: FormGroupDirective;

    constructor(
        private formBuilder: FormBuilder,
        private loaderDispatchService: LoaderDispatchService) {
    }

    ngOnInit() {
        console.log('hello `job-form` component');
        this.jobForm = this.formBuilder.group({
            truckCode: '',
            zoneCode: '',
            materialCode: '',
            targetWeight: ''
        });
    }

    ngOnDestroy() {
    }

    tryAgain() {
        this.formGroupDirective.resetForm(this.lastFormValue);
    }

    submitForm() {
        // Grab the value
        let formValue = this.jobForm.value;

        // Save the value here just in case stuff fails, we can restore the form
        this.lastFormValue = formValue;

        // Clear the last submit error
        this.lastSubmitError = null;

        // Clear the last submit result
        this.lastSubmitResult = null;

        // Mark it busy
        this.busy = true;

        // Transfer values from form to submit request
        let jobPost: IJob = {
            state: 'to-do',
            type: 'simple-truck',
            zone_code: formValue.zoneCode,
            instructions: {
                truck_code: formValue.truckCode,
                material_code: formValue.materialCode,
                target_material_weight: +formValue.targetWeight
            }
        };

        // this.busy = false;

        // console.log(JSON.stringify(jobPost));

        this.loaderDispatchService.createJob(jobPost, this.siteId).subscribe(
            /* next */ (value) => {
                this.lastSubmitError = null;
                this.lastSubmitResult = value;
            },
            /* error */ (error) => {
                this.lastSubmitError = error;
                this.lastSubmitResult = null;
                this.busy = false;
            },
            /* complete */ () => {
                this.busy = false;
            }
        );
    }
}
