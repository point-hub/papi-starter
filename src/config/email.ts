export interface IEmailConfig {
  endpoint: string
}

export const endpoint = process.env['EMAIL_ENDPOINT'] ?? ''

const emailConfig: IEmailConfig = {
  endpoint,
}

export default emailConfig
