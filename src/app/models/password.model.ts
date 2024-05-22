export interface ISelectData {
  id: number;
  value: string;
}

export interface IRawData {
  language: number;
  phrase: string;
  options: IPasswordOptions;
}

// export interface IPasswordOptions {
//   numbers: boolean;
//   symbols: boolean;
//   uppercase: boolean;
//   lowercase: boolean;
// }

export interface IPasswordOptions {
  [key: string]: boolean[];
}
