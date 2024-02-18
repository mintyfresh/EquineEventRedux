import { gql } from '@apollo/client'
import type { GetServerSideProps, NextPage } from 'next'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreateEventModal from '../../components/CreateEventModal'
import EventList, { EVENT_LIST_FRAGMENT } from '../../components/EventList'
import { DeletedFilter, EventsIndexQuery, useEventsIndexQuery } from '../../lib/generated/graphql'
import { initializeApolloClient } from '../../lib/graphql/client'
import { useRouter } from 'next/router'

const EVENTS_INDEX_QUERY = gql`
  query EventsIndex($deleted: DeletedFilter) {
    events(deleted: $deleted) {
      ...EventList
    }
  }
  ${EVENT_LIST_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async () => {
  const apolloClient = initializeApolloClient()

  await apolloClient.query<EventsIndexQuery>({
    query: EVENTS_INDEX_QUERY,
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract()
    }
  }
}

interface EventsIndexPageProps {
  events: NonNullable<EventsIndexQuery['events']>
}

const EventsIndexPage: NextPage<EventsIndexPageProps> = () => {
  const router = useRouter()
  const [deleted, setDeleted] = useState(false)
  const { data, refetch } = useEventsIndexQuery({
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
              router.push(`/events/${slug}`)
            }}
          />
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} Deleted
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

export default EventsIndexPage
