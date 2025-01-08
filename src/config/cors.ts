export interface ICorsConfig {
  origin: string
  credentials: boolean
}

export const origin = process.env['CORS_ORIGIN'] ?? ''
export const credentials: boolean = process.env['CORS_CREDENTIALS'] === 'true' ? true : false

const corsConfig: ICorsConfig = {
  origin,
  credentials,
}

export default corsConfig
