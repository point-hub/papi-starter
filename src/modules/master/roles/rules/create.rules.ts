/**
 * Available rules
 * https://github.com/mikeerickson/validatorjs?tab=readme-ov-file#available-rules
 */

export const createRules = {
  code: ['required', 'string'],
  name: ['required', 'string'],
  notes: ['string'],
};
