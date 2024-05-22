import { Injectable } from '@angular/core';
import { IPasswordOptions, IRawData } from '../models/password.model';
import { LanguagesType } from '../enums/languagesType';

@Injectable({
  providedIn: 'root'
})
export class TransformService {
  transformPassword(rawData: IRawData): string {
    const splitedPhrase: string[] = rawData.phrase.split(' ');

    if (splitedPhrase.length > 1) {
      return splitedPhrase
        .map(word => this.transformWord(word, rawData.options))
        .join('')
    } else {
      return this.transformWord(splitedPhrase[0], rawData.options);
    }
  }

  uppercaseFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private transformWord(word: string, options: IPasswordOptions): string {
    console.log(options);
    
    word = this.uppercaseFirstLetter(word);
    word = this.replaceALetter(word);
    word = this.replaceBLetter(word);
    word = this.replaceELetter(word);
    word = this.replaceILetter(word);
    word = this.replaceLLetter(word);
    word = this.replaceOLetter(word);
    return word;
  }

  private replaceALetter(word: string): string {
    return word.replaceAll(/a|A/g, '@');
  }

  private replaceBLetter(word: string): string {
    return word.replaceAll(/b|B/g, '6');
  }

  private replaceELetter(word: string): string {
    return word.replaceAll(/e|E/g, '3');
  }

  private replaceILetter(word: string): string {
    return word.replaceAll(/i|I/g, '!');
  }

  private replaceLLetter(word: string): string {
    return word.replaceAll(/l|L/g, '1');
  }

  private replaceOLetter(word: string): string {
    return word.replaceAll(/o|O/g, '0');
  }
}
