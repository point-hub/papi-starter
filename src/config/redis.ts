export const username = process.env.REDIS_USERNAME
export const password = process.env.REDIS_PASSWORD
export const host = process.env.REDIS_HOST || '127.0.0.1'
export const port = process.env.REDIS_PORT || '6379'
export const url = process.env.REDIS_URL || `redis://${host}:${port}`

const redisConfig = { url }

export default redisConfig
