import dotenv from 'dotenv'
import { cleanEnv, host, port, str, testOnly } from 'envalid'

dotenv.config()

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  PUBLIC_URL: str({}),
  COOKIE_SECRET: str({ devDefault: '00000000000000000000000000000000' }),
})
