import { Injectable } from '@angular/core';
import { IPasswordOptions, IRawData } from '../models/password.model';
import {
  NumberOptionsType,
  SubstitutionWithNumbersEnType,
  SubstitutionWithSymbolsEnType,
  SymbolOptionsType,
  UppercaseOptionsType
} from '../enums/transformOptionsType';

@Injectable({
  providedIn: 'root'
})
export class TransformService {
  transformPassword(rawData: IRawData): string {
    const { language, phrase, options } = rawData;
    let splitedPhrase: string[] = this.splitPhrase(phrase);

    if (options.uppercase[UppercaseOptionsType.All]) {
      this.convertToUpperCase(phrase);
    }

    if (options.uppercase[UppercaseOptionsType.None]) {
      this.convertToLowerCase(phrase);
    }

    if (options.uppercase[UppercaseOptionsType['One for the entire phrase']]) {
      splitedPhrase = this.addOneUppercaseLetter(this.convertToLowerCase(phrase));
    }

    if (options.numbers[NumberOptionsType['One for the entire phrase']]) {
      splitedPhrase = this.addOneNumber(splitedPhrase);
    }

    if (options.symbols[SymbolOptionsType['One for the entire phrase']]) {
      splitedPhrase = this.addOneSymbol(splitedPhrase);
    }

    if (splitedPhrase.length > 1) {
      return splitedPhrase
        .map(word => this.transformWord(word, options))
        .join('')
    } else {
      return this.transformWord(splitedPhrase[0], options);
    }
  }


  private transformWord(word: string, options: IPasswordOptions): string {
    // console.log(Object.keys(options));
    options.uppercase.forEach((option, i) => {
      if (option && i === UppercaseOptionsType.All) {
        word = this.uppercaseAllLetters(word);
      }

      if (option && i === UppercaseOptionsType['First letter per word']) {
        word = this.uppercaseFirstLetter(word);
      }

      if (option && i === UppercaseOptionsType['One letter per word']) {
        word = this.uppercaseOneLetter(word);
      }


      if (option && i === UppercaseOptionsType.None) {
        return;
      }
    })

    options.numbers.forEach((option, i) => {
      if (option && i === NumberOptionsType.All) {
        word = this.replaceAllLettersToNumbers(word);
      }

      if (option && i === NumberOptionsType.None) {
        return;
      }
    })

    options.symbols.forEach((option, i) => {
      if (option && i === SymbolOptionsType.All) {
        word = this.replaceAllLettersToSymbols(word);
      }

      if (option && i === SymbolOptionsType['One in every word']) {
        word = this.replaceOneLetterToSymbol(word);
      }

      if (option && i === SymbolOptionsType.None) {
        return;
      }
    })

    return word;
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

  private addOneUppercaseLetter(phrase: string): string[] {
    const splitedPhrase = this.splitPhrase(phrase);
    const randomWordNumber = this.randomIntFromInterval(0, splitedPhrase.length - 1);

    splitedPhrase[randomWordNumber] = this.uppercaseOneLetter(splitedPhrase[randomWordNumber]);

    return splitedPhrase;
  }

  private addOneNumber(splitedPhrase: string[]): string[] {
    const randomWordNumber = this.randomIntFromInterval(0, splitedPhrase.length - 1);
    const matches = this.foundMatches(splitedPhrase[randomWordNumber], 'number') as (keyof typeof SubstitutionWithNumbersEnType)[];
    const randomLetter = matches && matches.length > 1 ? this.randomIntFromInterval(0, matches.length -1) : 0;

    splitedPhrase[randomWordNumber] = this.replaceOneLetterToNumber(splitedPhrase[randomWordNumber], matches[randomLetter]);

    return splitedPhrase;
  }

  private addOneSymbol(splitedPhrase: string[]): string[] {
    const randomWordNumber = this.randomIntFromInterval(0, splitedPhrase.length - 1);
    const randomWord = splitedPhrase[randomWordNumber];
    const matches = this.foundMatches(randomWord, 'symbol') as (keyof typeof SubstitutionWithSymbolsEnType)[];
    const randomLetterPositionInMatches = matches && matches.length > 1 ? this.randomIntFromInterval(0, matches.length -1) : 0;
    const letter = matches[randomLetterPositionInMatches];
    const letterPositionInWord = randomWord.indexOf(letter);

    splitedPhrase[randomWordNumber] = matches.length ? 
      randomWord.slice(0, letterPositionInWord) + SubstitutionWithSymbolsEnType[letter] + randomWord.slice(letterPositionInWord + 1):
      this.addSimbolInRandomPosition(splitedPhrase[randomWordNumber]);

    return splitedPhrase;
  }

  private addSimbolInRandomPosition(word: string): string {
    const position = this.randomIntFromInterval(0, word.length - 1);
    const randomSymbolNumber = this.randomIntFromInterval(0, Object.keys(SubstitutionWithSymbolsEnType).length - 1);
    const randomSymbol = Object.values(SubstitutionWithSymbolsEnType)[randomSymbolNumber];

    return word.slice(0, position) + randomSymbol + word.slice(position + 1);
  }

  private convertToLowerCase(text: string): string {
    return text.toLowerCase();
  }

  private convertToUpperCase(text: string): string {
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
