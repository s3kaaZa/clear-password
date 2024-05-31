import { Injectable } from '@angular/core';
import { IPasswordOptions, IRawData } from '../models/password.model';
import {
  NumberOptionsType,
  SubstitutionWithNumbersEnType,
  SubstitutionWithSymbolsEnType,
  SymbolOptionsType,
  UppercaseOptionsType
} from '../enums/transformOptionsType';
import { ALL, FIRSTLETTER, NONE, PHRASE, WORD } from '../consts/create-password.consts';

@Injectable({
  providedIn: 'root'
})
export class TransformService {
  transformPassword(rawData: IRawData): string {
    let { language, phrase, options } = rawData;

    phrase = this.checkSpecificOptionsForEntirePhrase(phrase, options.uppercase);

    let splitedPhrase: string[] = this.checkSpecificOptionsForSplitedPhrase(this.splitPhrase(phrase), options);

    if (splitedPhrase.length > 1) {
      return splitedPhrase
        .map(word => this.transformWord(word, options))
        .join('')
    } else {
      return this.transformWord(splitedPhrase[0], options);
    }
  }

  private checkSpecificOptionsForEntirePhrase(phrase: string, options: boolean[]): string {
    if (options[this.getCheckboxIndex(UppercaseOptionsType, ALL)]) {
      console.log(111);

      return phrase = this.convertToUppercase(phrase);
    }

    if (options[this.getCheckboxIndex(UppercaseOptionsType, NONE)]) {
      return phrase = this.convertToLowercase(phrase);
    }

    return phrase;
  }

  private checkSpecificOptionsForSplitedPhrase(splitedPhrase: string[], options: IPasswordOptions): string[] {
    const prop = 'One for the entire phrase';
    const prop1 = 'OneInPhrase';

    if (options.uppercase[this.getCheckboxIndex(UppercaseOptionsType, PHRASE)]) {
      splitedPhrase = this.addOneUppercaseLetter(splitedPhrase);
    }

    if (options.numbers[this.getCheckboxIndex(NumberOptionsType, PHRASE)]) {
      splitedPhrase = this.addOneNumber(splitedPhrase);
    }

    if (options.symbols[this.getCheckboxIndex(SymbolOptionsType, PHRASE)]) {
      splitedPhrase = this.addOneSymbol(splitedPhrase);
    }

    return splitedPhrase;
  }


  private transformWord(word: string, options: IPasswordOptions): string {
    options.uppercase.forEach((option, i) => {
      if (option && i === this.getCheckboxIndex(UppercaseOptionsType, ALL)) {
        word = this.uppercaseAllLetters(word);
      }

      if (option && i === this.getCheckboxIndex(UppercaseOptionsType, FIRSTLETTER)) {
        word = this.uppercaseFirstLetter(word);
      }

      if (option && i === this.getCheckboxIndex(UppercaseOptionsType, WORD)) {
        word = this.uppercaseOneLetter(word);
      }
    })

    options.numbers.forEach((option, i) => {
      if (option && i === this.getCheckboxIndex(NumberOptionsType, ALL)) {
        word = this.replaceAllLettersToNumbers(word);
      }
    })

    options.symbols.forEach((option, i) => {
      if (option && i === this.getCheckboxIndex(SymbolOptionsType, ALL)) {
        word = this.replaceAllLettersToSymbols(word);
      }

      if (option && i === this.getCheckboxIndex(SymbolOptionsType, ALL)) {
        word = this.replaceOneLetterToSymbol(word);
      }
    })

    return word;
  }

  getCheckboxIndex(options: {[key: string]: string}, prop: string): number {
    return Object.keys(options).indexOf(prop)
  }

  private uppercaseAllLetters(word: string): string {
    return word.toUpperCase();
  }

  private uppercaseFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private uppercaseOneLetter(word: string): string {
    const randomLetterNumber = this.randomIntFromInterval(1, word.length - 1);

    return word.slice(0, randomLetterNumber) + word.charAt(randomLetterNumber).toUpperCase() + word.slice(randomLetterNumber + 1);
  }

  private replaceAllLettersToNumbers(word: string): string {
    let result = word;
    for (const [key, value] of Object.entries(SubstitutionWithNumbersEnType)) {
      const regex = new RegExp(key, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  private replaceOneLetterToNumber(word: string, letter: keyof typeof SubstitutionWithNumbersEnType): string {
    const position = word.indexOf(letter);

    return word.slice(0, position) + SubstitutionWithNumbersEnType[letter] + word.slice(position + 1);
  }

  private replaceAllLettersToSymbols(word: string): string {
    for (const [key, value] of Object.entries(SubstitutionWithSymbolsEnType)) {
      if (word.includes(key)) {
        word = word.replace(this.createRegEx(key, 'g'), value)
      }
    }

    return word;
  }

  private replaceOneLetterToSymbol(word: string): string {
    for (const [key, value] of Object.entries(SubstitutionWithSymbolsEnType)) {
      if (word.includes(key)) {
        return word.replace(this.createRegEx(key), value)
      }
    }

    return word;
  }

  private addOneUppercaseLetter(splitedPhrase: string[]): string[] {
    const randomWordNumber = this.randomIntFromInterval(0, splitedPhrase.length - 1);

    splitedPhrase[randomWordNumber] = this.uppercaseOneLetter(splitedPhrase[randomWordNumber]);

    return splitedPhrase;
  }

  private addOneNumber(splitedPhrase: string[]): string[] {
    const randomWordNumber = this.randomIntFromInterval(0, splitedPhrase.length - 1);
    const matches = this.foundMatches(splitedPhrase[randomWordNumber], 'number') as (keyof typeof SubstitutionWithNumbersEnType)[];
    const randomLetter = matches && matches.length > 1 ? this.randomIntFromInterval(0, matches.length - 1) : 0;

    splitedPhrase[randomWordNumber] = this.replaceOneLetterToNumber(splitedPhrase[randomWordNumber], matches[randomLetter]);

    return splitedPhrase;
  }

  private addOneSymbol(splitedPhrase: string[]): string[] {
    const randomWordNumber = this.randomIntFromInterval(0, splitedPhrase.length - 1);
    const randomWord = splitedPhrase[randomWordNumber];
    const matches = this.foundMatches(randomWord, 'symbol') as (keyof typeof SubstitutionWithSymbolsEnType)[];
    const randomLetterPositionInMatches = matches && matches.length > 1 ? this.randomIntFromInterval(0, matches.length - 1) : 0;
    const letter = matches[randomLetterPositionInMatches];
    const letterPositionInWord = randomWord.indexOf(letter);

    splitedPhrase[randomWordNumber] = matches.length ?
      randomWord.slice(0, letterPositionInWord) + SubstitutionWithSymbolsEnType[letter] + randomWord.slice(letterPositionInWord + 1) :
      this.addSimbolInRandomPosition(splitedPhrase[randomWordNumber]);

    return splitedPhrase;
  }

  private addSimbolInRandomPosition(word: string): string {
    const position = this.randomIntFromInterval(0, word.length - 1);
    const randomSymbolNumber = this.randomIntFromInterval(0, Object.keys(SubstitutionWithSymbolsEnType).length - 1);
    const randomSymbol = Object.values(SubstitutionWithSymbolsEnType)[randomSymbolNumber];

    return word.slice(0, position) + randomSymbol + word.slice(position + 1);
  }

  private convertToLowercase(text: string): string {
    return text.toLowerCase();
  }

  private convertToUppercase(text: string): string {
    return text.toUpperCase();
  }

  private splitPhrase(phrase: string): string[] {
    return phrase.split(' ');
  }

  private foundMatches(word: string, option: string): (keyof typeof SubstitutionWithNumbersEnType)[] | (keyof typeof SubstitutionWithSymbolsEnType)[] | undefined {
    let matches;

    switch (option) {
      case 'number':
        matches = Object.keys(SubstitutionWithNumbersEnType).filter(letter => word.includes(letter)) as (keyof typeof SubstitutionWithNumbersEnType)[];
        break;

      case 'symbol':
        matches = Object.keys(SubstitutionWithSymbolsEnType).filter(letter => word.includes(letter)) as (keyof typeof SubstitutionWithSymbolsEnType)[];
        break;
    }

    return matches;
  }

  private createRegEx(pattern: string, flags?: string): RegExp {
    return new RegExp(pattern, flags);
  }

  private randomIntFromInterval(min: number, max: number): number { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
