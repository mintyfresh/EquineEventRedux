import { GetServerSideProps } from 'next'
import React from 'react'
import { Alert, Container } from 'react-bootstrap'
import EventLayout from '../../../components/EventLayout'
import TimerList from '../../../components/TimerList/TimerList'
import { EventTimersDocument, EventTimersQuery, EventTimersQueryVariables, TimerListItemFragment, useEventTimersQuery, useTimerCreatedSubscription, useTimerDeletedSubscription, useTimerUpdatedSubscription } from '../../../lib/generated/graphql'
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

const upsertTimer = (newTimer: TimerListItemFragment, timers: TimerListItemFragment[]): TimerListItemFragment[] => {
  const index = timers.findIndex(({ id }) => id === newTimer.id)

  // no existing timer, append it to the end
  if (index === -1) {
    return [...timers, newTimer]
  }

  // we may have a data-race between the subscription and the query
  // the `Timer` embeds an `instant` field, which indicates when the timer was served to the client
  // hence, we can use this to prevent overwriting newer timer data with older data
  const updatedTimer =
    new Date(newTimer.instant).getTime() > new Date(timers[index].instant).getTime()
      ? newTimer // if the new timer object is most recent, use it
      : timers[index] // otherwise, keep the existing one

  return [
    ...timers.slice(0, index),
    updatedTimer,
    ...timers.slice(index + 1)
  ]
}

type EventTimersPageProps = EventTimersQuery & {
  slug: string
  fullscreen: boolean
}

const EventTimersPage: NextPageWithLayout<EventTimersPageProps> = ({ slug, fullscreen, event }) => {
  const eventId = event.id
  
  const { data, client } = useEventTimersQuery({
    variables: { eventId: slug }
  })

  const currentRound = data ? data.event.currentRound : event.currentRound
  const roundId = currentRound?.id
  const roundTimers = currentRound?.timers ?? []

  const onTimerCreate = (timer: TimerListItemFragment) => {
    data && client.writeQuery<EventTimersQuery, EventTimersQueryVariables>({
      query: EventTimersDocument,
      variables: { eventId },
      data: {
        ...data,
        event: {
          ...data.event,
          currentRound: data.event.currentRound && {
            ...data.event.currentRound,
            timers: upsertTimer(timer, roundTimers)
          }
        }
      }
    })
  }

  const onTimerDelete = (id: string) => {
    data && client.writeQuery<EventTimersQuery, EventTimersQueryVariables>({
      query: EventTimersDocument,
      variables: { eventId },
      data: {
        ...data,
        event: {
          ...data.event,
          currentRound: data.event.currentRound && {
            ...data.event.currentRound,
            timers: roundTimers.filter((timer) => timer.id !== id)
          }
        }
      }
    })
  }

  useTimerCreatedSubscription({
    skip: !roundId,
    fetchPolicy: 'no-cache', // we manually add the element to the cache
    variables: { roundId: roundId! },
    onData: ({ data: { data: subscription } }) => {
      subscription?.timerCreated && onTimerCreate(subscription.timerCreated.timer)
    }
  })

  useTimerUpdatedSubscription({
    skip: !roundId,
    variables: { roundId: roundId! } // apollo will automatically handle these events
  })

  useTimerDeletedSubscription({
    skip: !roundId,
    fetchPolicy: 'no-cache', // we manually remove the element from the cache
    variables: { roundId: roundId! },
    onData: ({ data: { data: subscription } }) => {
      subscription?.timerDeleted && onTimerDelete(subscription.timerDeleted.timerId)
    }
  })

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
      onTimerCreate={onTimerCreate}
      onTimerDelete={({ id }) => onTimerDelete(id)}
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
