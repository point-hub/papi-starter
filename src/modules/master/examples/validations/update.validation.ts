/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const updateValidation = {
  _id: ['string'],
  name: ['sometimes', 'required', 'string'],
  age: ['sometimes', 'required', 'integer', 'max:100', 'min:17'],
  nationality: ['sometimes', 'required'],
  notes: ['string'],
}
