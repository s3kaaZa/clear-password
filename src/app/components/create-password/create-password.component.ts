import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LanguagesType } from '../../enums/languagesType';
import { IPasswordOptions, ISelectData } from '../../models/password.model';
import { TransformService } from '../../services/transform.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LowercaseOptionsType, NumberOptionsType, SymbolOptionsType, UppercaseOptionsType } from '../../enums/transformOptionsType';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.scss'
})
export class CreatePasswordComponent implements OnInit {
  defaultNumberCheckboxes = [
    {
      name: NumberOptionsType[0],
      checked: false
    },
    {
      name: NumberOptionsType[1],
      checked: true
    },
    {
      name: NumberOptionsType[2],
      checked: false
    }
  ];
  defaultSymbolCheckboxes = [
    {
      name: SymbolOptionsType[0],
      checked: false
    },
    {
      name: SymbolOptionsType[1],
      checked: false
    },
    {
      name: SymbolOptionsType[2],
      checked: true
    },
    {
      name: SymbolOptionsType[3],
      checked: false
    }
  ];
  defaultUppercaseCheckboxes = [
    {
      name: UppercaseOptionsType[0],
      checked: false
    },
    {
      name: UppercaseOptionsType[1],
      checked: true
    },
    {
      name: UppercaseOptionsType[2],
      checked: false
    },
    {
      name: UppercaseOptionsType[3],
      checked: false
    },
    {
      name: UppercaseOptionsType[4],
      checked: false
    }
  ];
  defaultLowercaseCheckboxes = [
    {
      name: LowercaseOptionsType[0],
      checked: true
    },
    {
      name: LowercaseOptionsType[1],
      checked: false
    }
  ];
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
  optionsFormGroup = this.fb.group({
    numbers: this.fb.array(this.defaultNumberCheckboxes.map(cb => this.fb.control<boolean>(cb.checked))),
    symbols: this.fb.array(this.defaultSymbolCheckboxes.map(cb => this.fb.control<boolean>(cb.checked))),
    uppercase: this.fb.array(this.defaultUppercaseCheckboxes.map(cb => this.fb.control<boolean>(cb.checked))),
    lowercase: this.fb.array(this.defaultLowercaseCheckboxes.map(cb => this.fb.control<boolean>(cb.checked)))
  });
  calculatedPasswordFormGroup = this.fb.group({
    password: new FormControl('')
  });

  constructor(
    private fb: FormBuilder,
    private transformService: TransformService,
    private sb: MatSnackBar
  ) { }

  ngOnInit() {
    this.initLanguages();
  }

  get numbers(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls.numbers as FormArray<FormControl<boolean>>;
  }

  get symbols(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls.symbols as FormArray<FormControl<boolean>>;
  }

  get uppercase(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls.uppercase as FormArray<FormControl<boolean>>;
  }

  get lowercase(): FormArray<FormControl<boolean>> {
    return this.optionsFormGroup.controls.lowercase as FormArray<FormControl<boolean>>;
  }

  get hasPharaseValue(): boolean {
    return !this.phraseFormGroup.controls.phrase.value;
  }

  initLanguages() {
    this.languages = Object.values(LanguagesType).filter(e => isNaN(Number(e)));
    this.languagesOption = this.languages
      .map((e: string, i: number) => ({
        id: i,
        value: e
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

    if (formArrayName === 'uppercase' && i === UppercaseOptionsType.All) {
      this.lowercase.setValue([false, true]);
      this.showSnackBarMessage('Value from "Lowercase letters" was changed!');
    }

    if (formArrayName === 'uppercase' && i === UppercaseOptionsType.None && this.lowercase.value[LowercaseOptionsType.None]) {
      this.lowercase.setValue([true, false]);
      this.showSnackBarMessage('Value from "Lowercase letters" was changed!');
    }

    if (formArrayName === 'uppercase' && i !== UppercaseOptionsType.All && this.lowercase.value[LowercaseOptionsType.None]) {
      this.lowercase.setValue([true, false]);
      this.showSnackBarMessage('Value from "Lowercase letters" was changed!');
    }

    if (formArrayName === 'lowercase' && i === LowercaseOptionsType.None && !this.uppercase.value[UppercaseOptionsType.All]) {
      this.uppercase.setValue([true, false, false, false, false]);
      this.showSnackBarMessage('Value from "Uppercase letters" was changed!');
    }

    if (formArrayName === 'lowercase' && i !== LowercaseOptionsType.None && this.uppercase.value[UppercaseOptionsType.All]) {
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
}
