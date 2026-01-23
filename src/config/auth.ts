export interface IAuthConfig {
  issuer: string
  secret: string
}

export const issuer = process.env['JWT_ISSUER'] ?? 'auth-domain';
export const secret = process.env['JWT_SECRET'] ?? 'secret123';

const authConfig: IAuthConfig = { issuer, secret };

export default authConfig;
