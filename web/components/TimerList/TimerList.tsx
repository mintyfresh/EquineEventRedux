import React, { useState } from 'react'
import { Alert, Col, Row } from 'react-bootstrap'
import { TimerListFragment, TimerListFragmentDoc, TimerListItemFragment, useTimerListItemCreatedSubscription, useTimerListItemDeletedSubscription, useTimerListItemUpdatedSubscription } from '../../lib/generated/graphql'
import TimerListControlBar from './TimerListControlBar'
import TimerListItem from './TimerListItem'
import { useApolloClient } from '@apollo/client'

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
    ? { ... timers[index], ...timer } // if the new timer object is most recent, use it
    : timers[index] // otherwise, keep the existing one

  return [
    ...timers.slice(0, index),
    latestTimer,
    ...timers.slice(index + 1)
  ]
}

export interface TimerListProps {
  timerList: TimerListFragment
  pinControlsToTop?: boolean
  readOnly?: boolean
}

const TimerList: React.FC<TimerListProps> = ({ timerList, pinControlsToTop, readOnly }) => {
  const client = useApolloClient()
  const [columns, setColumns] = useState<number>(1)

  const onTimerCreate = (timer: TimerListItemFragment) => {
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

  const onTimerUpdate = (timer: TimerListItemFragment) => {
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

  const onTimerDelete = (timerId: string) => {
    client.cache.updateFragment<TimerListFragment>(
      {
        id: client.cache.identify(timerList),
        fragment: TimerListFragmentDoc,
        fragmentName: 'TimerList',
        overwrite: true
      },
      (data) => ({
        ...data ?? timerList,
        timers: (data ?? timerList).timers.filter((timer) => timer.id !== timerId)
      })
    )
  }

  useTimerListItemCreatedSubscription({
    variables: { roundId: timerList.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ data: { data } }) {
      if (data?.timerCreated?.timer) {
        // add the new timer to the list
        onTimerCreate(data.timerCreated.timer)
      }
    }
  })

  useTimerListItemUpdatedSubscription({
    variables: { roundId: timerList.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ data: { data } }) {
      if (data?.timerUpdated?.timer) {
        // update the current timer
        onTimerUpdate(data.timerUpdated.timer)
      }
    }
  })

  useTimerListItemDeletedSubscription({
    variables: { roundId: timerList.id },
    fetchPolicy: 'no-cache', // manage cache manually
    onData({ data: { data } }) {
      if (data?.timerDeleted?.timerId) {
        // remove the timer from the list
        onTimerDelete(data.timerDeleted.timerId)
      }
    }
  
  })

  return (
    <>
      <TimerListControlBar
        roundId={timerList.id}
        pinToTop={pinControlsToTop}
        readOnly={readOnly}
        onTimerCreate={onTimerCreate}
        onColumnsSelect={setColumns}
      />
      {timerList.timers.length > 0 ? (
        <Row className="justify-content-center">
          {timerList.timers.map((timer) => (
            <Col key={timer.id} className="pb-5" md={12 / columns}>
              <TimerListItem
                timerList={timerList}
                timer={timer}
                readOnly={readOnly}
                onCreate={onTimerCreate}
                onUpdate={onTimerUpdate}
                onDelete={({ id }) => onTimerDelete(id)}
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
