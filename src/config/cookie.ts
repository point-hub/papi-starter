export interface ICookieConfig {
  secret: string
}

export const secret = process.env['COOKIE_SECRET'] ?? '';

const cookieConfig: ICookieConfig = {
  secret,
};

export default cookieConfig;
