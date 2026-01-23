export interface IAblyConfig {
  ablyApiKey: string
}

export const ablyApiKey = process.env['ABLY_API_KEY'] ?? '';

const ablyConfig: IAblyConfig = { ablyApiKey };

export default ablyConfig;
