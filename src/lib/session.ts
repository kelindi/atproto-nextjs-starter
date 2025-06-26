import { SessionOptions } from 'iron-session'
import { env } from './env'

export interface SessionData {
  did?: string
}

export const sessionOptions: SessionOptions = {
  cookieName: 'sid',
  password: env.COOKIE_SECRET,
  cookieOptions: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: 'lax', // Allow cross-origin requests but provide some CSRF protection
    path: '/', // Make cookie available across all paths
  },
} 