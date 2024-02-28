'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreateEventModal from '../../components/CreateEventModal'
import EventList, { EVENT_LIST_FRAGMENT } from '../../components/EventList'
import { DeletedFilter, EventsIndexQuery, EventsIndexQueryVariables } from '../../lib/generated/graphql'

const EVENTS_INDEX_QUERY = gql`
  query EventsIndex($deleted: DeletedFilter) {
    events(deleted: $deleted) {
      ...EventList
    }
  }
  ${EVENT_LIST_FRAGMENT}
`

export default function EventsIndexPage() {
  const router = useRouter()
  const [deleted, setDeleted] = useState(false)
  const { data, refetch } = useQuery<EventsIndexQuery, EventsIndexQueryVariables>(EVENTS_INDEX_QUERY,{
    variables: { deleted: deleted ? DeletedFilter.Deleted : undefined }
  })

  if (!data?.events) {
    return null
  }

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
            }}
          />
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} deleted
        </Button>
      </ButtonToolbar>
      <EventList
        nodes={data.events.nodes}
        onDelete={() => refetch()}
        onRestore={() => refetch()}
      />
      {data.events.nodes.length === 0 && (
        <Card body>
          <Card.Text>No {deleted && 'deleted'} events found.</Card.Text>
        </Card>
      )}
    </>
  )
}
