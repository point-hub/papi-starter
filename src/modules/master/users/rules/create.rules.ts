export const createRules = {
  email: ['required', 'string', 'email'],
  password: ['required', 'string', 'min:8'],
  name: ['required', 'string', 'min:5', 'max:50'],
  username: ['required', 'string', 'min:5', 'max:24', 'username_format'],
  role_id: ['required', 'string'],
};
