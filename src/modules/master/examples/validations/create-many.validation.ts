/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const createManyValidation = {
  'examples.*.name': ['required', 'string'],
  'examples.*.age': ['required', 'integer', 'max:100', 'min:17'],
  'examples.*.nationality': ['required'],
  'examples.*.notes': ['string'],
}
