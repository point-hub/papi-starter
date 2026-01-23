/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const createRules = {
  code: ['required', 'string'],
  name: ['required', 'string'],
  composite_unique_1: ['required', 'string'],
  composite_unique_2: ['required', 'string'],
  age: ['integer', 'max:100', 'min:17'],
  gender: ['required', 'string'],
  notes: ['string'],
};
