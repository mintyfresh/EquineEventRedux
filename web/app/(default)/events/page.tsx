'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreateEventModal from '../../../components/CreateEventModal'
import { DeletedFilter, EventListItemFragment, EventsIndexDocument, EventsIndexQuery, EventsIndexQueryVariables } from '../../../lib/generated/graphql'
import EventList from './EventList'
import { ApolloClient } from '@apollo/client'

function sortEventsList(events: EventListItemFragment[]) {
  return events.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function onEventCreate<T>(event: EventListItemFragment, client: ApolloClient<T>) {
  client.cache.updateQuery<EventsIndexQuery>(
    {
      query: EventsIndexDocument
    },
    (data) => (data && (
      {
        ...data,
        events: {
          ...data.events,
          nodes: [event, ...data.events.nodes]
        }
      }
    ))
  )
}

export function onEventDelete<T>(event: EventListItemFragment, client: ApolloClient<T>) {
  // Remove the event from the main list
  client.cache.updateQuery<EventsIndexQuery>(
    {
      query: EventsIndexDocument
    },
    (data) => (data && (
      {
        ...data,
        events: {
          ...data.events,
          nodes: data.events.nodes.filter(({ id }) => id !== event.id)
        }
      }
    ))
  )

  // Add the event to the deleted list
  client.cache.updateQuery<EventsIndexQuery>(
    {
      query: EventsIndexDocument,
      variables: { deleted: DeletedFilter.Deleted }
    },
    (data) => (data && (
      {
        ...data,
        events: {
          ...data.events,
          nodes: sortEventsList([event, ...data.events.nodes])
        }
      }
    ))
  )
}

export function onEventRestore<T>(event: EventListItemFragment, client: ApolloClient<T>) {
  // Remove the event from the deleted list
  client.cache.updateQuery<EventsIndexQuery>(
    {
      query: EventsIndexDocument,
      variables: { deleted: DeletedFilter.Deleted }
    },
    (data) => (data && (
      {
        ...data,
        events: {
          ...data.events,
          nodes: data.events.nodes.filter(({ id }) => id !== event.id)
        }
      }
    ))
  )

  // Add the event to the main list
  client.cache.updateQuery<EventsIndexQuery>(
    {
      query: EventsIndexDocument
    },
    (data) => (data && (
      {
        ...data,
        events: {
          ...data.events,
          nodes: sortEventsList([event, ...data.events.nodes])
        }
      }
    ))
  )
}

export default function EventsIndexPage() {
  const router = useRouter()
  const [deleted, setDeleted] = useState(false)
  const { client, data } = useSuspenseQuery<EventsIndexQuery, EventsIndexQueryVariables>(EventsIndexDocument,{
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
            }}
          />
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} deleted
        </Button>
      </ButtonToolbar>
      <EventList
        events={data.events.nodes}
        onDelete={(event) => onEventDelete(event, client)}
        onRestore={(event) => onEventRestore(event, client)}
      />
      {data.events.nodes.length === 0 && (
        <Card body>
          <Card.Text>No {deleted && 'deleted'} events found.</Card.Text>
        </Card>
      )}
    </>
  )
}
