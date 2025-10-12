/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const createManyValidation = {
  'module_examples.*.name': ['required', 'string'],
  'module_examples.*.age': ['required', 'integer', 'max:100', 'min:17'],
  'module_examples.*.nationality': ['required'],
  'module_examples.*.notes': ['string'],
}
