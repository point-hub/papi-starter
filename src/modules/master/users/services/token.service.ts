import jwt, { type JwtPayload } from 'jsonwebtoken';

import authConfig from '@/config/auth';

export const TOKEN_TYPE = 'Bearer';

export interface ITokenPayload {
  iss: string
  sub: string
  iat: number
  exp: number
}

export interface ITokenService {
  getTokenFromHeader(authorization?: string): string | null
  createToken(id: string, expiresInMs: number): string
  createAccessToken(id: string): string
  createRefreshToken(id: string): string
  verifyToken(token: string): string | JwtPayload
  isExpired(exp: number): boolean
}

const ONE_MINUTE = 1000 * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_MONTH = ONE_DAY * 30;

export const TokenService: ITokenService = {
  // Extract the token from an Authorization header
  getTokenFromHeader(authorization) {
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === TOKEN_TYPE && token ? token : null;
  },

  // Generic token creator with configurable expiration
  createToken(id, expiresInMs) {
    const now = Date.now();
    const exp = now + expiresInMs;
    const payload: ITokenPayload = {
      iss: authConfig.issuer,
      sub: id,
      iat: now,
      exp,
    };
    return jwt.sign(payload, authConfig.secret);
  },

  // 30-minutes access token
  createAccessToken(id) {
    return this.createToken(id, ONE_MINUTE * 30);
  },

  // 30-day refresh token
  createRefreshToken(id) {
    return this.createToken(id, ONE_MONTH);
  },

  // Verify token validity and signature
  verifyToken(token) {
    return jwt.verify(token, authConfig.secret);
  },

  // Check if a token is expired
  isExpired(exp) {
    return Date.now() >= exp;
  },
};
