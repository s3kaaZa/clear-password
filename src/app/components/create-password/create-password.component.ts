import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LanguagesType } from '../../enums/languagesType';
import { IPasswordOptions, ISelectData } from '../../models/password.model';
import { TransformService } from '../../services/transform.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.scss'
})
export class CreatePasswordComponent implements OnInit {
  defaultNumberCheckboxes = [
    {
      name: 'All',
      checked: false
    },
    {
      name: 'One',
      checked: true
    }
  ];
  defaultSymbolCheckboxes = [
    {
      name: 'All',
      checked: false
    },
    {
      name: 'One in every word',
      checked: false
    },
    {
      name: 'One',
      checked: true
    }
  ];
  defaultUppercaseCheckboxes = [
    {
      name: 'All',
      checked: false
    },
    {
      name: 'First letter',
      checked: true
    },
    {
      name: 'One',
      checked: false
    }
  ];
  defaultLowercaseCheckboxes = [
    {
      name: 'Lowercase letters',
      checked: true
    }
  ];
  isLinear = false;
  languages: any;
  languagesOption: ISelectData[];
  calculatedPassword: string;
  languageFormGroup = this.fb.group({
    lang: new FormControl(LanguagesType.ENGLISH, Validators.required)
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
        value: this.transformService.uppercaseFirstLetter(e)
      }));
  }

  calculate() {    
    const passwordRawData = {
      language: this.languageFormGroup.controls.lang.value ?? LanguagesType.ENGLISH,
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
    this.sb.open('Copied to clipboard!!!', '', {
      duration: 3000,
      horizontalPosition: 'center'
    })
  }

  toggleCheckboxes(controls: FormArray, i: number) {
    const values = controls.value.map((c: boolean, index: number) => i === index);

    controls.setValue(values);
  }
}
