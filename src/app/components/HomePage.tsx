'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type Status = {
  uri: string
  authorDid: string
  status: string
  createdAt: string
  indexedAt: string
}

interface HomePageProps {
  statuses: Status[]
  didHandleMap: Record<string, string>
  profile?: { displayName?: string }
  myStatus?: Status
  currentUserDid?: string
}

// Available status emoji options
const STATUS_OPTIONS = [
  '👍', '👎', '💙', '🥹', '😧', '🙃', '😉', '😎', 
  '🤓', '🤨', '🥳', '😭', '😤', '🤯', '🫡', '💀', 
  '✊', '🤘', '👀', '🧠', '👩‍💻', '🧑‍💻', '🥷', '🧌', 
  '🦋', '🚀'
]

export default function HomePage({
  statuses,
  didHandleMap,
  profile,
  myStatus,
  currentUserDid,
}: HomePageProps) {
  const router = useRouter()

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
      
      <Header />
      
      <div className="container">
        <UserSessionCard profile={profile} />
        <StatusSelector 
          statusOptions={STATUS_OPTIONS}
          currentStatus={myStatus?.status}
          onStatusClick={handleStatusClick}
        />
        <StatusFeed 
          statuses={statuses}
          didHandleMap={didHandleMap}
          currentUserDid={currentUserDid}
        />
      </div>
    </div>
  )
}

function Header() {
  return (
    <div id="header">
      <h1>Statusphere</h1>
      <p>Set your status on the Atmosphere.</p>
    </div>
  )
}

function UserSessionCard({ profile }: { profile?: { displayName?: string } }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingOut(true)
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Redirect to home page and refresh to show logged out state
          router.push('/')
          router.refresh()
        } else {
          console.error('Logout failed:', data.error || 'Unknown error')
          setIsLoggingOut(false)
        }
      } else {
        console.error('Logout failed:', response.statusText)
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      setIsLoggingOut(false)
    }
  }

  if (profile) {
    return (
      <div className="card">
        <div className="session-form">
          <div>
            Hi, <strong>{profile.displayName || 'friend'}</strong>. What&apos;s your status today?
          </div>
          <div>
            <button 
              type="button" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ opacity: isLoggingOut ? 0.6 : 1 }}
            >
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="session-form">
        <div>
          <a href="/login">Log in</a> to set your status!
        </div>
        <div>
          <a href="/login" className="button">Log in</a>
        </div>
      </div>
    </div>
  )
}

interface StatusSelectorProps {
  statusOptions: string[]
  currentStatus?: string
  onStatusClick: (status: string) => void
}

function StatusSelector({ statusOptions, currentStatus, onStatusClick }: StatusSelectorProps) {
  return (
    <div className="status-options">
      {statusOptions.map((status) => (
        <button
          key={status}
          className={currentStatus === status ? 'status-option selected' : 'status-option'}
          onClick={() => onStatusClick(status)}
        >
          {status}
        </button>
      ))}
    </div>
  )
}

interface StatusFeedProps {
  statuses: Status[]
  didHandleMap: Record<string, string>
  currentUserDid?: string
}

function StatusFeed({ statuses, didHandleMap, currentUserDid }: StatusFeedProps) {
  return (
    <>
      {statuses.map((status, index) => (
        <StatusLine
          key={status.uri}
          status={status}
          handle={didHandleMap[status.authorDid] || status.authorDid}
          isFirst={index === 0}
          currentUserDid={currentUserDid}
        />
      ))}
    </>
  )
}

interface StatusLineProps {
  status: Status
  handle: string
  isFirst: boolean
  currentUserDid?: string
}

function StatusLine({ status, handle, isFirst, currentUserDid }: StatusLineProps) {
  const date = formatStatusDate(status)
  const isToday = date === new Date().toDateString()
  const isCurrentUser = currentUserDid === status.authorDid
  
  return (
    <div className={isFirst ? 'status-line no-line' : 'status-line'}>
      <div>
        <div className="status">{status.status}</div>
      </div>
      <div className="desc">
        <a className="author" href={toBskyLink(handle)}>
          @{handle}
        </a>
        {isCurrentUser && <span style={{ fontWeight: 'bold', color: '#0078ff' }}> (You)</span>}
        {' '}
        {isToday 
          ? `is feeling ${status.status} today`
          : `was feeling ${status.status} on ${date}`
        }
      </div>
    </div>
  )
}

function toBskyLink(handle: string): string {
  return `https://bsky.app/profile/${handle}`
}

function formatStatusDate(status: Status): string {
  const createdAt = new Date(status.createdAt)
  const indexedAt = new Date(status.indexedAt)
  const relevantDate = createdAt < indexedAt ? createdAt : indexedAt
  return relevantDate.toDateString()
}
