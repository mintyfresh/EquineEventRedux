import { gql } from '@apollo/client'
import type { GetServerSideProps, NextPage } from 'next'
import { Card } from 'react-bootstrap'
import CreateEventModal from '../../components/CreateEventModal'
import EventList, { EVENT_LIST_FRAGMENT } from '../../components/EventList'
import { EventsIndexQuery, useEventsIndexQuery } from '../../lib/generated/graphql'
import { initializeApolloClient } from '../../lib/graphql/client'

const EVENTS_INDEX_QUERY = gql`
  query EventsIndex {
    events {
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
  const { data, refetch } = useEventsIndexQuery()

  if (!data?.events) {
    return null
  }

  return (
    <>
      <h1>Events</h1>
      <CreateEventModal
        onCreate={() => refetch()}
      />
      <EventList nodes={data.events.nodes} />
      {data.events.nodes.length === 0 && (
        <Card body>
          <Card.Text>No events found.</Card.Text>
        </Card>
      )}
    </>
  )
}

export default EventsIndexPage
