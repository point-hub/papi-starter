export interface IStorageConfig {
  endpoint: string
}

export const endpoint = process.env['STORAGE_ENDPOINT'] ?? '';

const storageConfig: IStorageConfig = {
  endpoint,
};

export default storageConfig;
