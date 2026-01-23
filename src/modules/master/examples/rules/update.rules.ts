/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const updateRules = {
  code: ['sometimes', 'required', 'string'],
  name: ['sometimes', 'required', 'string'],
  composite_unique_1: ['sometimes', 'required', 'string'],
  composite_unique_2: ['sometimes', 'required', 'string'],
  age: ['integer', 'max:100', 'min:17'],
  gender: ['sometimes', 'required', 'string'],
  notes: ['string'],
};
