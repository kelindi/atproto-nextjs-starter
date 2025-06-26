'use client'

import { useRouter } from 'next/navigation'

export type Status = {
  uri: string
  authorDid: string
  status: string
  createdAt: string
  indexedAt: string
}

export default function HomePage({
  statuses,
  didHandleMap,
  profile,
  myStatus,
}: {
  statuses: Status[]
  didHandleMap: Record<string, string>
  profile?: { displayName?: string }
  myStatus?: Status
}) {
  const router = useRouter()
  const statusOptions = [
    '👍','👎','💙','🥹','😧','🙃','😉','😎','🤓','🤨','🥳','😭','😤','🤯','🫡','💀','✊','🤘','👀','🧠','👩‍💻','🧑‍💻','🥷','🧌','🦋','🚀'
  ]

  const handleStatusClick = async (status: string) => {
    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ status }),
      })
      
      if (response.ok) {
        // Give the server a moment to process the update
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        console.error('Failed to update status:', response.statusText)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <div id="root">
      <div className="error"></div>
      <div id="header">
        <h1>Statusphere</h1>
        <p>Set your status on the Atmosphere.</p>
      </div>
      <div className="container">
        <div className="card">
          {profile ? (
            <form action="/api/logout" method="post" className="session-form">
              <div>
                Hi, <strong>{profile.displayName || 'friend'}</strong>. What&apos;s your status today?
              </div>
              <div>
                <button type="submit">Log out</button>
              </div>
            </form>
          ) : (
            <div className="session-form">
              <div><a href="/login">Log in</a> to set your status!</div>
              <div>
                <a href="/login" className="button">Log in</a>
              </div>
            </div>
          )}
        </div>
        <div className="status-options">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={myStatus?.status === status ? 'status-option selected' : 'status-option'}
              onClick={() => handleStatusClick(status)}
            >
              {status}
            </button>
          ))}
        </div>
        {statuses.map((status, i) => {
          const handle = didHandleMap[status.authorDid] || status.authorDid
          const date = ts(status)
          return (
            <div key={status.uri} className={i === 0 ? 'status-line no-line' : 'status-line'}>
              <div>
                <div className="status">{status.status}</div>
              </div>
              <div className="desc">
                <a className="author" href={toBskyLink(handle)}>@{handle}</a>{' '}
                {date === new Date().toDateString() ?
                  `is feeling ${status.status} today` :
                  `was feeling ${status.status} on ${date}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function toBskyLink(did: string) {
  return `https://bsky.app/profile/${did}`
}

function ts(status: Status) {
  const createdAt = new Date(status.createdAt)
  const indexedAt = new Date(status.indexedAt)
  if (createdAt < indexedAt) return createdAt.toDateString()
  return indexedAt.toDateString()
}
