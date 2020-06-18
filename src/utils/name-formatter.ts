import { isObject, isString } from 'lodash';

export interface IPersonLike {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
}

function isPersonLike(obj: any): obj is IPersonLike {
  return obj && isObject(obj) && obj.hasOwnProperty('lastName'); // пока пусть так
}

export function prepareNamePart(src?: string | null): string {
  if (!src || !isString(src)) {
    return '';
  }

  src = src.trim();

  if (src.length > 0) {
    return `${src.charAt(0).toUpperCase()}${src.substr(1)}`;
  }

  return ''; // штош
}

export class NameFormatter {
  lastName = '';
  firstName = '';
  middleName = '';

  constructor(person?: IPersonLike | null);
  constructor(
    lastName?: string | null,
    firstName?: string | null,
    middleName?: string | null,
  );
  constructor(src: any, firstName?: string | null, middleName?: string | null) {
    if (isPersonLike(src)) {
      this.lastName = prepareNamePart(src.lastName);
      this.firstName = prepareNamePart(src.firstName);
      this.middleName = prepareNamePart(src.middleName);
    } else {
      this.lastName = prepareNamePart(src ? src.toString() : null);
      this.firstName = prepareNamePart(firstName);
      this.middleName = prepareNamePart(middleName);
    }
  }

  isEmpty() {
    return !this.lastName && !this.firstName && !this.middleName;
  }

  /**
   * Фамилия Имя Отчество
   */
  getFullName(): string {
    return [this.lastName, this.firstName, this.middleName]
      .filter(part => !!part)
      .join(' ');
  }

  getAsFIO() {
    return this.getFullName();
  }

  getAsIOF() {
    return [this.firstName, this.middleName, this.lastName]
      .filter(part => !!part)
      .join(' ');
  }

  /**
   * Фамилия И. О.
   */
  getShortName(): string {
    let res = this.lastName;
    if (this.firstName) {
      res += ' ' + this.firstName.slice(0, 1) + '.';
    }
    if (this.middleName) {
      res += ' ' + this.middleName.slice(0, 1) + '.';
    }

    return res;
  }

  /**
   * Для например писем с уведомлениями, где можно по имени
   */
  getFriendlyName(): string {
    return this.firstName || this.lastName;
  }
}
