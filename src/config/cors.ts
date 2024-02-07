export const origin = process.env.CORS_ORIGIN ?? ''
export const credentials: boolean = process.env.CORS_CREDENTIALS === 'true' ? true : false

export default {
  origin,
  credentials,
}
