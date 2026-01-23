export interface IAuthConfig {
  issuer: string
  secret: string
}

export const issuer = process.env['JWT_ISSUER'] ?? '';
export const secret = process.env['JWT_SECRET'] ?? '';

const authConfig: IAuthConfig = { issuer, secret };

export default authConfig;
