'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreateEventModal from '../../../components/CreateEventModal'
import { DeletedFilter, EventsIndexDocument, EventsIndexQuery, EventsIndexQueryVariables } from '../../../lib/generated/graphql'
import EventList from './EventList'

export default function EventsIndexPage() {
  const router = useRouter()
  const [deleted, setDeleted] = useState(false)
  const { data, refetch } = useSuspenseQuery<EventsIndexQuery, EventsIndexQueryVariables>(EventsIndexDocument, {
    variables: { deleted: deleted ? DeletedFilter.Deleted : undefined }
  })

  return (
    <>
      <h1>Events</h1>
      <ButtonToolbar className="mb-3">
        {deleted ? (
          <span className="text-muted mt-auto">
            Viewing deleted events only.
          </span>
        ) : (
          <CreateEventModal
            onCreate={({ slug }) => {
              router.push(`/events/${slug}/players`)
              refetch()
            }}
          />
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} deleted
        </Button>
      </ButtonToolbar>
      <div className="mb-5">
        <EventList
          events={data.events.nodes}
        />
        {data.events.nodes.length === 0 && (
          <Card body>
            <Card.Text>No {deleted && 'deleted'} events found.</Card.Text>
          </Card>
        )}
      </div>
    </>
  )
}
