export const updatePasswordRules = {
  current_password: ['required', 'string'],
  new_password: ['required', 'string', 'min:8'],
};
