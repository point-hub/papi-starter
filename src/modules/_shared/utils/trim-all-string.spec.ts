import { describe, expect,it } from 'bun:test';

import { trimAllString } from './trim-all-string';

describe('trimAllString', () => {
  it('trims a single string', () => {
    const input = '  hello  ';
    const result = trimAllString(input);

    expect(result).toBe('hello');
  });

  it('trims strings in a flat object', () => {
    const input = {
      name: '  John  ',
      email: '  johndoe@example.com ',
    };

    const result = trimAllString(input);

    expect(result).toEqual({
      name: 'John',
      email: 'johndoe@example.com',
    });
  });

  it('trims strings in nested objects', () => {
    const input = {
      user: {
        name: '  Alice ',
        profile: {
          bio: ' Hello World ',
        },
      },
    };

    const result = trimAllString(input);

    expect(result).toEqual({
      user: {
        name: 'Alice',
        profile: {
          bio: 'Hello World',
        },
      },
    });
  });

  it('trims strings inside arrays', () => {
    const input = [' foo ', ' bar ', ' baz '];

    const result = trimAllString(input);

    expect(result).toEqual(['foo', 'bar', 'baz']);
  });

  it('trims strings in nested arrays and objects', () => {
    const input = {
      tags: [' foo ', { label: ' bar ' }],
    };

    const result = trimAllString(input);

    expect(result).toEqual({
      tags: ['foo', { label: 'bar' }],
    });
  });

  it('does not modify non-string values', () => {
    const input = {
      age: 30,
      active: true,
      score: null,
      count: undefined,
    };

    const result = trimAllString(input);

    expect(result).toEqual(input);
  });

  it('does not modify Date objects', () => {
    const date = new Date();
    const input = { createdAt: date };

    const result = trimAllString(input);

    expect(result.createdAt).toBe(date);
  });

  it('does not mutate the original input', () => {
    const input = {
      name: ' John ',
      nested: {
        value: ' test ',
      },
    };

    const copy = structuredClone(input);
    trimAllString(input);

    expect(input).toEqual(copy);
  });
});
