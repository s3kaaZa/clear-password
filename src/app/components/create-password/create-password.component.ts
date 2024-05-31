import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguagesType } from '../../enums/languagesType';
import { CheckboxOption, IPasswordOptions, ISelectData } from '../../models/password.model';
import { TransformService } from '../../services/transform.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LowercaseOptionsType, NumberOptionsType, SymbolOptionsType, UppercaseOptionsType } from '../../enums/transformOptionsType';
import { ALL, FIRSTLETTER, LOWERCASE, NONE, PHRASE } from '../../consts/create-password.consts';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.scss'
})
export class CreatePasswordComponent implements OnInit {
  defaultNumberCheckboxeIndex: number;
  defaultSymbolCheckboxeIndex: number;
  defaultUppercaseCheckboxeIndex: number;
  defaultLowercaseCheckboxeIndex: number;
  defaultNumberCheckboxes: CheckboxOption[];
  defaultSymbolCheckboxes: CheckboxOption[];
  defaultUppercaseCheckboxes: CheckboxOption[];
  defaultLowercaseCheckboxes: CheckboxOption[];
  isLinear = false;
  languages: any;
  languagesOption: ISelectData[];
  calculatedPassword: string;
  languageFormGroup = this.fb.group({
    lang: new FormControl(LanguagesType.English, Validators.required)
  });
  phraseFormGroup = this.fb.group({
    phrase: new FormControl('red crocodile with horns', Validators.required) // TODO: delete value
  })
  optionsFormGroup: FormGroup;
  calculatedPasswordFormGroup = this.fb.group({
    password: new FormControl('')
  });

  private transformService = inject(TransformService);
  private sb = inject(MatSnackBar);

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initLanguages();
    this.initCheckboxesDefaultState();

    this.optionsFormGroup = this.fb.group({
      numbers: this.fb.array(this.defaultNumberCheckboxes.map(cb => this.fb.control<boolean>(cb.checked))),
      symbols: this.fb.array(this.defaultSymbolCheckboxes.map(cb => this.fb.control<boolean>(cb.checked))),
      uppercase: this.fb.array(this.defaultUppercaseCheckboxes.map(cb => this.fb.control<boolean>(cb.checked))),
      lowercase: this.fb.array(this.defaultLowercaseCheckboxes.map(cb => this.fb.control<boolean>(cb.checked)))
    });
  }

  getCheckboxes(options: { [key: string]: string}): CheckboxOption[] {
    return Object
        .values(options)
        .filter(name => typeof name !== 'number')
        .map(name => ({
          name,
          checked: false
        }))
  }

  get numbers(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls['numbers'] as FormArray<FormControl<boolean>>;
  }

  get symbols(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls['symbols'] as FormArray<FormControl<boolean>>;
  }

  get uppercase(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls['uppercase'] as FormArray<FormControl<boolean>>;
  }

  get lowercase(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls['lowercase'] as FormArray<FormControl<boolean>>;
  }

  get hasPharaseValue(): boolean {
    return !this.phraseFormGroup.controls.phrase.value;
  }

  private initLanguages() {
    this.languages = Object.values(LanguagesType).filter(e => isNaN(Number(e)));
    this.languagesOption = this.languages
      .map((lang: string, i: number) => ({
        id: i,
        value: lang
      }));
  }

  calculate() {
    const passwordRawData = {
      language: this.languageFormGroup.controls.lang.value ?? LanguagesType.English,
      phrase: this.phraseFormGroup.controls.phrase.value ?? 'qwertyuiop',
      options: this.optionsFormGroup.value as IPasswordOptions
    }
    this.calculatedPassword = this.transformService.transformPassword(passwordRawData);
    this.calculatedPasswordFormGroup.setValue({
      password: this.calculatedPassword
    });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.calculatedPasswordFormGroup.controls.password.value!);
    this.showSnackBarMessage('Copied to clipboard!!!');
  }

  toggleCheckboxes(controls: FormArray, i: number, formArrayName: string) {
    const values = controls.value.map((c: boolean, index: number) => i === index);

    if (
      formArrayName === 'uppercase'
      && i === this.transformService.getCheckboxIndex(UppercaseOptionsType, ALL)
    ) {
      this.lowercase.setValue([false, true]);
      this.showSnackBarMessage('Value from "Lowercase letters" was changed!');
    }

    if (
      formArrayName === 'uppercase'
      && i === this.transformService.getCheckboxIndex(UppercaseOptionsType, NONE)
      && this.lowercase.value[this.transformService.getCheckboxIndex(LowercaseOptionsType, NONE)]
    ) {
      this.lowercase.setValue([true, false]);
      this.showSnackBarMessage('Value from "Lowercase letters" was changed!');
    }

    if (formArrayName === 'uppercase'
      && i !== this.transformService.getCheckboxIndex(UppercaseOptionsType, ALL)
      && this.lowercase.value[this.transformService.getCheckboxIndex(LowercaseOptionsType, NONE)]
    ) {
      this.lowercase.setValue([true, false]);
      this.showSnackBarMessage('Value from "Lowercase letters" was changed!');
    }

    if (formArrayName === 'lowercase'
      && i === this.transformService.getCheckboxIndex(LowercaseOptionsType, NONE)
      && !this.uppercase.value[this.transformService.getCheckboxIndex(UppercaseOptionsType, ALL)]

    ) {
      this.uppercase.setValue([true, false, false, false, false]);
      this.showSnackBarMessage('Value from "Uppercase letters" was changed!');
    }

    if (formArrayName === 'lowercase'
      && i !== this.transformService.getCheckboxIndex(LowercaseOptionsType, NONE)
      && this.uppercase.value[this.transformService.getCheckboxIndex(UppercaseOptionsType, ALL)]
    ) {
      this.uppercase.setValue([false, true, false, false, false]);
      this.showSnackBarMessage('Value from "Uppercase letters" was changed!');
    }

    controls.setValue(values);
  }

  private showSnackBarMessage(message: string, action?: string): void {
    this.sb.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center'
    })
  }

  private initCheckboxesDefaultState() {
    this.defaultNumberCheckboxes = this.getCheckboxes(NumberOptionsType);
    this.defaultNumberCheckboxeIndex = this.transformService.getCheckboxIndex(NumberOptionsType, PHRASE);
    this.defaultNumberCheckboxes[this.defaultNumberCheckboxeIndex].checked = true;
    this.defaultSymbolCheckboxes = this.getCheckboxes(SymbolOptionsType);
    this.defaultSymbolCheckboxeIndex = this.transformService.getCheckboxIndex(SymbolOptionsType, PHRASE);
    this.defaultSymbolCheckboxes[this.defaultSymbolCheckboxeIndex].checked = true;
    this.defaultUppercaseCheckboxes = this.getCheckboxes(UppercaseOptionsType);
    this.defaultUppercaseCheckboxeIndex = this.transformService.getCheckboxIndex(UppercaseOptionsType, FIRSTLETTER);
    this.defaultUppercaseCheckboxes[this.defaultUppercaseCheckboxeIndex].checked = true;
    this.defaultLowercaseCheckboxes = this.getCheckboxes(LowercaseOptionsType);
    this.defaultLowercaseCheckboxeIndex = this.transformService.getCheckboxIndex(LowercaseOptionsType, LOWERCASE);
    this.defaultLowercaseCheckboxes[this.defaultLowercaseCheckboxeIndex].checked = true;
  }
}
