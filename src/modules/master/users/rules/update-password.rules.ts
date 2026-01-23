export const updatePasswordRules = {
  current_password: ['required', 'string'],
  password: ['required', 'string', 'min:8'],
};
