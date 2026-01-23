import Validator from 'validatorjs';

export function registerUsernameFormatRules() {
  // Custom Rule: Username Format (Alphanumeric and Dot only)
  Validator.register(
    'username_format',
    function (value) {
      // Allow only letters (a-z, A-Z), numbers (0-9), and the dot symbol (.).
      const usernameRegex = /^[a-zA-Z0-9.]+$/;

      // Ensure it's a string and matches the pattern.
      return typeof value === 'string' && usernameRegex.test(value);
    },
    'The :attribute field must only contain letters, numbers, and the dot symbol (.).',
  );
}
