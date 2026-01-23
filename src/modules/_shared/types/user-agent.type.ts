export interface IUserAgent {
  browser: {
    type: string | undefined,
    name: string | undefined,
    version: string | undefined,
  },
  os: {
    name: string | undefined,
    version: string | undefined,
  },
  device: {
    type: string | undefined,
    model: string | undefined,
    vendor: string | undefined,
  },
}