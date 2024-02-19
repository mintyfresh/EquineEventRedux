import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import TimerInlineCreateForm from '../../../components/Timer/InlineCreateForm'
import TimerListItem, { TIMER_LIST_ITEM_FRAGMENT } from '../../../components/Timer/ListItem'
import { TIMER_PRESET_SELECT_FRAGMENT } from '../../../components/TimerPreset/Select'
import { EventTimersQuery, EventTimersQueryVariables, TimerCreateInput, TimerEventType, TimerEventSubscription, TimerFragment, useCreateTimerMutation, useEventTimersQuery, useTimerEventSubscription, usePauseTimerMutation, useUnpauseTimerMutation, useUpdateTimerMutation, useDeleteTimerMutation, useTimerDeletedSubscription, useResetTimerMutation, useSkipTimerToNextPhaseMutation } from '../../../lib/generated/graphql'
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
    timerPresets {
      nodes {
        ...TimerPresetSelect
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${TIMER_FRAGMENT}
  ${TIMER_PRESET_SELECT_FRAGMENT}
`

gql`
  subscription TimerEvent($eventId: ID!) {
    timerEvent(eventId: $eventId) {
      eventType
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
  mutation CreateTimer($eventId: ID!, $input: TimerCreateInput!) {
    timerCreate(eventId: $eventId, input: $input) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
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
  mutation ResetTimer($id: ID!) {
    timerReset(id: $id) {
      timer {
        ...Timer
      }
    }
  }
  ${TIMER_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventTimersQuery, EventTimersQueryVariables>({
    query: EVENT_TIMERS_QUERY,
    variables: { id: params.id as string },
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      id: params.id,
      event: data.event
    }
  }
}

const mergeTimers = (data: EventTimersQuery, event: TimerEventSubscription['timerEvent']): TimerFragment[] => {
  switch (event.eventType) {
    case TimerEventType.Create: {
      const timers = data.event!.timers ?? []
      const exists = timers.some((timer) => timer.id === event.timer!.id)

      if (!event.timer || exists) {
        return timers
      }

      return [
        ...data.event!.timers,
        event.timer
      ]
    }
    default: {
      const timers = data.event!.timers ?? []

      return timers.map((timer) =>
        timer.id === event.timer!.id
          ? event.timer!
          : timer
      )
    }
  }
}

const EventTimersPage: NextPageWithLayout<{ id: string } & EventTimersQuery> = ({ id, event: { id: eventId } }) => {
  const { data } = useEventTimersQuery({
    variables: { id }
  })

  useTimerEventSubscription({
    variables: { eventId },
    onData: ({ client, data: { data: subscription } }) => {
      data && subscription?.timerEvent && client.writeQuery<EventTimersQuery, EventTimersQueryVariables>({
        query: EVENT_TIMERS_QUERY,
        variables: { id },
        data: {
          ...data,
          event: {
            ...data.event,
            timers: mergeTimers(data, subscription.timerEvent)
          }
        }
      })
    }
  })

  useTimerDeletedSubscription({
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

  const [timerCreateInput, setTimerCreateInput] = useState<TimerCreateInput>({ presetId: '' })

  const [createTimer, {}] = useCreateTimerMutation({
    variables: { eventId, input: timerCreateInput }
  })

  const [updateTimer, {}] = useUpdateTimerMutation()
  const [deleteTimer, {}] = useDeleteTimerMutation()
  const [pauseTimer, {}] = usePauseTimerMutation()
  const [unpauseTimer, {}] = useUnpauseTimerMutation()
  const [skipToNextPhase, {}] = useSkipTimerToNextPhaseMutation()
  const [resetTimer, {}] = useResetTimerMutation()

  if (!data?.event) {
    return null
  }

  return (
    <div className="w-100">
      <TimerInlineCreateForm
        presets={data.timerPresets.nodes}
        input={timerCreateInput}
        onUpdate={setTimerCreateInput}
        onSubmit={() => {
          createTimer()
        }}
      />
      <div>
        {data.event.timers.map((timer) => (
          <div className="pb-5" key={timer.id}>
            <TimerListItem
              timer={timer}
              onLabelUpdate={({ id }, label) => updateTimer({ variables: { id, input: { label } } })}
              onPause={({ id }) => pauseTimer({ variables: { id } })}
              onUnpause={({ id }) => unpauseTimer({ variables: { id } })}
              onDelete={({ id }) => deleteTimer({ variables: { id } })}
              onReset={({ id }) => (
                confirm('Are you sure you want to reset this timer?') &&
                  resetTimer({ variables: { id } })
              )}
              onSkipToNextPhase={({ id }) => skipToNextPhase({ variables: { id } })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

EventTimersPage.getLayout = (page: React.ReactElement<EventTimersQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventTimersPage
