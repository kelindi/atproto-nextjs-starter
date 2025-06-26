'use client'

export default function LoginPage({ error }: { error?: string }) {
  return (
    <div id="root">
      <div id="header">
        <h1>Statusphere</h1>
        <p>Set your status on the Atmosphere.</p>
      </div>
      <div className="container">
        <form action="/api/login" method="post" className="login-form">
          <input
            type="text"
            name="handle"
            placeholder="Enter your handle (eg alice.bsky.social)"
            required
          />
          <button type="submit">Log in</button>
          {error ? <p>Error: <i>{error}</i></p> : null}
        </form>
        <div className="signup-cta">
          Don&apos;t have an account on the Atmosphere?{' '}
          <a href="https://bsky.app">Sign up for Bluesky</a> to create one now!
        </div>
      </div>
    </div>
  )
}
