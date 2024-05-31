import { SubstitutionWithNumbersEnType, SubstitutionWithSymbolsEnType } from "../enums/transformOptionsType";

type PasswordOptionPropertyName =  'numbers' | 'symbols' | 'uppercase' | 'lowercase';
type PasswordOptionsRecord = { [P in PasswordOptionPropertyName]: boolean[] };
export interface ISelectData {
  id: number;
  value: string;
}

export interface CheckboxOption {
  name: string;
  checked: boolean;
}

export interface IRawData {
  language: number;
  phrase: string;
  options: IPasswordOptions;
}

export interface IPasswordOptions extends PasswordOptionsRecord {}

export type SubstitutionEnType = keyof typeof SubstitutionWithNumbersEnType | keyof typeof SubstitutionWithSymbolsEnType;