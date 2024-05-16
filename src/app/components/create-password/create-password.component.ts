import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { LanguagesType } from '../../enums/languagesType';
import { ISelectData } from '../../models/password.model';
import { TransformService } from '../../services/transform.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.scss'
})
export class CreatePasswordComponent implements OnInit {
  isLinear = false;
  languages: any;
  languagesOption: ISelectData[];
  calculatedPassword: string;
  languageFormGroup = this.fb.group({
    lang: new FormControl(LanguagesType.ENGLISH, Validators.required)
  });
  phraseFormGroup = this.fb.group({
    phrase: new FormControl('red crocodile', Validators.required) // TODO: delete value
  })
  optionsFormGroup = this.fb.group({
    numbers: new FormControl(true),
    symbols: new FormControl(true),
    uppercase: new FormControl(true),
    lowercase: new FormControl(true)
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

  initLanguages() {
    this.languages = Object.values(LanguagesType).filter(e => isNaN(Number(e)));
    this.languagesOption = this.languages
      .map((e: string, i: number) => ({
        id: i,
        value: this.transformService.uppercaseFirstLetter(e)
      }));
    console.log(this.languagesOption)
  }

  calculate() {
      const passwordRawData = {
        language: this.languageFormGroup.controls.lang.value ?? LanguagesType.ENGLISH,
        phrase: this.phraseFormGroup.controls.phrase.value ?? 'qwertyuiop',
        options: {
          numbers: true,
          symbols: true,
          uppercase: true,
          lowercase: true
        }
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
}
