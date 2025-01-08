export interface IApiConfig {
  baseUrl: string
  clientUrl: string
}

export const baseUrl = `${process.env['BASE_URL']}`
export const clientUrl = `${process.env['CLIENT_URL']}`

const apiConfig: IApiConfig = { baseUrl, clientUrl }

export default apiConfig
