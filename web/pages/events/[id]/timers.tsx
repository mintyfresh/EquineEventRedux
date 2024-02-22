import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import TimerControlsBar from '../../../components/Timer/TimerControlsBar'
import TimerListItem, { TIMER_LIST_ITEM_FRAGMENT } from '../../../components/Timer/TimerListItem'
import { EventTimersQuery, EventTimersQueryVariables, TimerFragment, useCloneTimerWithExtensionMutation, useDeleteTimerMutation, useEventTimersQuery, usePauseTimerMutation, useResetTimerMutation, useSkipTimerToNextPhaseMutation, useTimerCreatedSubscription, useTimerDeletedSubscription, useTimerUpdatedSubscription, useUnpauseTimerMutation, useUpdateTimerMutation } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const TIMER_FRAGMENT = gql`
  fragment Timer on Timer {
    ...TimerListItem
  }
  ${TIMER_LIST_ITEM_FRAGMENT}
`

const EVENT_TIMERS_QUERY = gql`
  query EventTimers($id: ID!) {
    event(id: $id) {
      id
      name
      ...EventLayout
      timers {
        ...Timer
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${TIMER_FRAGMENT}
`

gql`
  subscription TimerCreated($eventId: ID!) {
    timerCreated(eventId: $eventId) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  subscription TimerUpdated($eventId: ID!) {
    timerUpdated(eventId: $eventId) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  subscription TimerDeleted($eventId: ID!) {
    timerDeleted(eventId: $eventId) {
      timerId
    }
  }
`

gql`
  mutation UpdateTimer($id: ID!, $input: TimerUpdateInput!) {
    timerUpdate(id: $id, input: $input) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  mutation DeleteTimer($id: ID!) {
    timerDelete(id: $id) {
      success
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  mutation PauseTimer($id: ID!) {
    timerPause(id: $id) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  mutation UnpauseTimer($id: ID!) {
    timerUnpause(id: $id) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  mutation SkipTimerToNextPhase($id: ID!) {
    timerSkipToNextPhase(id: $id) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  mutation CloneTimerWithExtension($id: ID!, $input: TimerCloneWithExtensionInput!) {
    timerCloneWithExtension(id: $id, input: $input) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

gql`
  mutation ResetTimer($id: ID!) {
    timerReset(id: $id) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const fullscreen = query.fullscreen === 'true'

  const { data } = await apolloClient.query<EventTimersQuery, EventTimersQueryVariables>({
    query: EVENT_TIMERS_QUERY,
    variables: { id: params.id as string },
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      id: params.id,
      event: data.event,
      fullscreen
    }
  }
}

const upsertTimer = (newTimer: TimerFragment, timers: TimerFragment[]): TimerFragment[] => {
  const index = timers.findIndex(({ id }) => id === newTimer.id)

  // no existing timer, append it to the end
  if (index === -1) {
    return [...timers, newTimer]
  }

  const updatedTimer =
    new Date(newTimer.instant).getTime() > new Date(timers[index].instant).getTime()
      ? newTimer // if the new timer object is most recent, use it
      : timers[index] // otherwise, keep the old one

  return [
    ...timers.slice(0, index),
    updatedTimer,
    ...timers.slice(index + 1)
  ]
}

type EventTimersPageProps = EventTimersQuery & {
  id: string
  fullscreen: boolean
}

const EventTimersPage: NextPageWithLayout<EventTimersPageProps> = ({ id, fullscreen, event: { id: eventId } }) => {
  const { data } = useEventTimersQuery({
    variables: { id }
  })

  useTimerCreatedSubscription({
    fetchPolicy: 'no-cache', // we manually add the element to the cache
    variables: { eventId },
    onData: ({ client, data: { data: subscription } }) => {
      data && subscription?.timerCreated && client.writeQuery<EventTimersQuery, EventTimersQueryVariables>({
        query: EVENT_TIMERS_QUERY,
        variables: { id },
        data: {
          ...data,
          event: {
            ...data.event,
            timers: upsertTimer(subscription.timerCreated.timer, data.event.timers)
          }
        }
      })
    }
  })

  useTimerUpdatedSubscription({
    variables: { eventId } // apollo will automatically handle these events
  })

  useTimerDeletedSubscription({
    fetchPolicy: 'no-cache', // we manually remove the element from the cache
    variables: { eventId },
    onData: ({ client, data: { data: subscription } }) => {
      data && subscription?.timerDeleted && client.writeQuery<EventTimersQuery, EventTimersQueryVariables>({
        query: EVENT_TIMERS_QUERY,
        variables: { id },
        data: {
          ...data,
          event: {
            ...data.event,
            timers: (data.event?.timers ?? []).filter((timer) =>
              timer.id !== subscription.timerDeleted.timerId
            )
          }
        }
      })
    }
  })

  const [updateTimer, {}] = useUpdateTimerMutation()
  const [deleteTimer, {}] = useDeleteTimerMutation()
  const [pauseTimer, {}] = usePauseTimerMutation()
  const [unpauseTimer, {}] = useUnpauseTimerMutation()
  const [skipToNextPhase, {}] = useSkipTimerToNextPhaseMutation()
  const [cloneWithExtension, {}] = useCloneTimerWithExtensionMutation()
  const [resetTimer, {}] = useResetTimerMutation()

  if (!data?.event) {
    return null
  }

  const colProps: Partial<React.ComponentProps<typeof Col>> =
    fullscreen
      ? { xs: 12, sm: 6, md: 4 }
      : { xs: 12, md: 6 }

  return (
    <>
      {!fullscreen && (
        <TimerControlsBar
          eventId={data.event.id}
        />
      )}
      <Row className="justify-content-center">
        {data.event.timers.map((timer) => (
          <Col className="pb-5" key={timer.id} {...colProps}>
            <TimerListItem
              timer={timer}
              readOnly={fullscreen}
              onLabelUpdate={({ id }, label) => updateTimer({ variables: { id, input: { label } } })}
              onPause={({ id }) => pauseTimer({ variables: { id } })}
              onUnpause={({ id }) => unpauseTimer({ variables: { id } })}
              onDelete={({ id }) => (
                confirm('Are you sure you want to delete this timer?') &&
                  deleteTimer({ variables: { id } })
              )}
              onReset={({ id }) => (
                confirm('Are you sure you want to reset this timer?') &&
                  resetTimer({ variables: { id } })
              )}
              onSkipToNextPhase={({ id }) => skipToNextPhase({ variables: { id } })}
              onClone={({ id }, input) => cloneWithExtension({ variables: { id, input } })}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

EventTimersPage.getLayout = (page: React.ReactElement<EventTimersPageProps>) => (
  page.props.fullscreen ? (
    <Container fluid style={{ 'minHeight': '100vh' }} className="d-flex flex-column justify-content-center">
      {page}
    </Container>
  ) : (
    <EventLayout event={page.props.event}>
      {page}
    </EventLayout>
  )
)

export default EventTimersPage
