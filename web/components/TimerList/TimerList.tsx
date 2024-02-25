import React from 'react'
import { Alert, Col, Row } from 'react-bootstrap'
import { TimerListFragment, TimerListFragmentDoc, TimerListItemFragment, useTimerListItemCreatedSubscription, useTimerListItemDeletedSubscription, useTimerListItemUpdatedSubscription } from '../../lib/generated/graphql'
import TimerListControlBar from './TimerListControlBar'
import TimerListItem from './TimerListItem'

const upsertTimerListItem = (timers: TimerListItemFragment[], timer: TimerListItemFragment) => {
  const index = timers.findIndex((t) => t.id === timer.id)

  // append the new timer if it doesn't exist
  if (index === -1) {
    return [...timers, timer]
  }

  // we may have a data-race between the subscription and the query
  // the `Timer` embeds an `instant` field, which indicates when the timer was served to the client
  // hence, we can use this to prevent overwriting newer timer data with older data
  const latestTimer = new Date(timer.instant).getTime() > new Date(timers[index].instant).getTime()
    ? timer // if the new timer object is most recent, use it
    : timers[index] // otherwise, keep the existing one

  return [
    ...timers.slice(0, index),
    latestTimer,
    ...timers.slice(index + 1)
  ]
}

export interface TimerListProps {
  timerList: TimerListFragment
  onTimerCreate?(timer: TimerListItemFragment): void
  onTimerUpdate?(timer: TimerListItemFragment): void
  onTimerDelete?(timer: TimerListItemFragment): void
  readOnly?: boolean
}

const TimerList: React.FC<TimerListProps> = ({ timerList, onTimerCreate, onTimerUpdate, onTimerDelete, readOnly }) => {
  useTimerListItemCreatedSubscription({
    variables: { roundId: timerList.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerCreated?.timer) return

      const timer = data.timerCreated.timer

      // add the new timer to the list
      client.cache.updateFragment<TimerListFragment>(
        {
          id: client.cache.identify(timerList),
          fragment: TimerListFragmentDoc,
          fragmentName: 'TimerList'
        },
        (data) => ({
          ...data ?? timerList,
          timers: upsertTimerListItem((data ?? timerList).timers, timer)
        })
      )
    }
  })

  useTimerListItemUpdatedSubscription({
    variables: { roundId: timerList.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerUpdated?.timer) return

      const timer = data.timerUpdated.timer

      // update the current timer
      client.cache.updateFragment<TimerListFragment>(
        {
          id: client.cache.identify(timerList),
          fragment: TimerListFragmentDoc,
          fragmentName: 'TimerList'
        },
        (data) => ({
          ...data ?? timerList,
          timers: upsertTimerListItem((data ?? timerList).timers, timer)
        })
      )
    }
  })

  useTimerListItemDeletedSubscription({
    variables: { roundId: timerList.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ client, data: { data } }) {
      if (!data?.timerDeleted?.timerId) return

      const id = data.timerDeleted.timerId

      // remove the timer from the list
      client.cache.updateFragment<TimerListFragment>(
        {
          id: client.cache.identify(timerList),
          fragment: TimerListFragmentDoc,
          fragmentName: 'TimerList',
          overwrite: true
        },
        (data) => ({
          ...data ?? timerList,
          timers: (data ?? timerList).timers.filter((timer) => timer.id !== id)
        })
      )
    }
  
  })

  return (
    <>
      {!readOnly && (
        <TimerListControlBar
          roundId={timerList.id}
          onTimerCreate={onTimerCreate}
        />
      )}
      {timerList.timers.length > 0 ? (
        <Row className="justify-content-center">
          {timerList.timers.map((timer) => (
            <Col key={timer.id} className="pb-5" md="6">
              <TimerListItem
                timerList={timerList}
                timer={timer}
                readOnly={readOnly}
                onCreate={onTimerCreate}
                onUpdate={onTimerUpdate}
                onDelete={onTimerDelete}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="mt-3">
          No timers have been set for this round yet.
        </Alert>
      )}
    </>
  )
}

export default TimerList
