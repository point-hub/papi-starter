/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const createValidation = {
  name: ['required', 'string'],
  age: ['required', 'integer', 'max:100', 'min:17'],
  nationality: ['required'],
  notes: ['string'],
}
