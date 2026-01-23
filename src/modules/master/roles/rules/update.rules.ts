/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const updateRules = {
  code: ['sometimes', 'required', 'string'],
  name: ['sometimes', 'required', 'string'],
  notes: ['string'],
};
