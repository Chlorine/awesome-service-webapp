import { Utils } from './utils';

const wordCases: number[] = [2, 0, 1, 1, 1, 2];

export const wordFrom = (count: number, words: string[]): string => {
  count = checkCount(count);
  return words[
    count % 100 > 4 && count % 100 < 20
      ? 2
      : wordCases[count % 10 < 5 ? count % 10 : 5]
  ];
};

const checkCount = (count: number): number => {
  count = Utils.isInteger(count) ? count : 0;
  if (count < 0) count *= -1;

  return count;
};

export class Pluralize {
  static wordFrom(count: number, words: string[]): string {
    count = checkCount(count);
    return words[
      count % 100 > 4 && count % 100 < 20
        ? 2
        : wordCases[count % 10 < 5 ? count % 10 : 5]
    ];
  }

  static count(count: number, words: string[]): string {
    return `${count} ${wordFrom(count, words)}`;
  }
}

export const Words = {
  Events: ['мероприятие', 'мероприятия', 'мероприятий'],
  Visitors: ['посетитель', 'посетителя', 'посетителей'],
  ActiveEvents: ['активное', 'активных', 'активных'],
};
