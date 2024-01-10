import { createClient, RedisClientType } from 'redis'

export class RedisClient {
  public client: RedisClientType
  constructor(
    public url: string,
    public name: string,
  ) {
    this.client = createClient({ url: url })
    this.client.on('connect', () =>
      console.info(`Pointhub Redis ${this.name} is connected to ${this.hidePassword(url)}`),
    )
    this.client.on('error', (err: unknown) => console.error(`Pointhub Redis ${this.name} Error`, err))
  }

  private hidePassword(url: string) {
    /**
     * Return original url if it's localhost
     */
    if (url.includes('redis://127.0.0.1')) {
      return url
    }
    /**
     * Separate ':'
     * [redis]:[//$REDIS_USERNAME]:[$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT]
     * if url is localhost : redis://127.0.0.1:${port}
     */
    const x = url.split(':', 3)
    /**
     * Separate '@' to get password from array[0]
     * [$REDIS_PASSWORD]@[$REDIS_HOST:$REDIS_PORT]
     */
    const y = x[2].split('@', 1)
    /**
     * Return url but replacing password with asterik
     */
    return url.replace(y[0], '*****')
  }

  public async connect() {
    await this.client.connect()
  }

  public async disconnect() {
    await this.client.disconnect()
  }
}
