import { GetServerSideProps } from 'next'
import React from 'react'
import { Alert, Container } from 'react-bootstrap'
import EventLayout from '../../../components/EventLayout'
import TimerList from '../../../components/TimerList/TimerList'
import { EventTimersDocument, EventTimersQuery, EventTimersQueryVariables, useEventTimersQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const fullscreen = query.fullscreen === 'true'

  const { data } = await apolloClient.query<EventTimersQuery, EventTimersQueryVariables>({
    query: EventTimersDocument,
    variables: { eventId: params.id as string },
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      slug: params.id,
      event: data.event,
      fullscreen
    }
  }
}

type EventTimersPageProps = EventTimersQuery & {
  slug: string
  fullscreen: boolean
}

const EventTimersPage: NextPageWithLayout<EventTimersPageProps> = ({ slug, fullscreen, event }) => {
  const { data } = useEventTimersQuery({
    variables: { eventId: slug }
  })

  const currentRound = data ? data.event.currentRound : event.currentRound

  if (!currentRound) {
    return (
      <Alert variant="warning">
        There is no round currently active to run timers for.
      </Alert>
    )
  }

  return (
    <TimerList
      timerList={currentRound}
      readOnly={fullscreen}
    />
  )
}

EventTimersPage.getLayout = (page: React.ReactElement<EventTimersPageProps>) => (
  page.props.fullscreen ? (
    <Container style={{ 'minHeight': '100vh' }} className="d-flex flex-column justify-content-center">
      {page}
    </Container>
  ) : (
    <EventLayout event={page.props.event}>
      {page}
    </EventLayout>
  )
)

export default EventTimersPage
