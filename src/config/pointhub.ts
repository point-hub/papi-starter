export interface IPointhubConfig {
  secret: string
}

export const secret = process.env['POINTHUB_SECRET'] ?? ''

const pointhubConfig: IPointhubConfig = { secret }

export default pointhubConfig
