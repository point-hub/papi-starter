import { trimAllString } from '../utils/trim-all-string';

export abstract class BaseEntity<T> {
  protected normalize(input: T): T {
    return trimAllString(input);
  }
}