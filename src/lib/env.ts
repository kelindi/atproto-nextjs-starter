import dotenv from 'dotenv'
import { cleanEnv, host, port, str } from 'envalid'

dotenv.config()

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: 'development',
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: 'localhost' }),
  PORT: port({ devDefault: 3000 }),
  PUBLIC_URL: str({ devDefault: 'http://localhost:3000' }),
  COOKIE_SECRET: str({ devDefault: '00000000000000000000000000000000' }),
})
