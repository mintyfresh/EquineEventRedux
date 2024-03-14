'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useEffect, useState } from 'react'
import { Alert, Button, ButtonToolbar, Card, OverlayTrigger, Tooltip } from 'react-bootstrap'
import CreateRoundButton from '../../../../../components/CreateRoundButton'
import RoundList from '../../../../../components/RoundList'
import { RoundViewMode } from '../../../../../components/RoundList/RoundListItem'
import { DeletedFilter, EventMatchesDocument, EventMatchesQuery, EventMatchesQueryVariables, useSetMatchResolutionMutation } from '../../../../../lib/generated/graphql'

export default function EventMatchesPage({ params: { id } }: { params: { id: string } }) {
  const [view, setView] = useState<RoundViewMode>(RoundViewMode.Grid)
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch } = useSuspenseQuery<EventMatchesQuery, EventMatchesQueryVariables>(EventMatchesDocument, {
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined },
    fetchPolicy: 'cache-and-network'
  })

  const [setResolution, { loading: settingResolution }] = useSetMatchResolutionMutation()

  const onSetWinner = (matchId: string, winnerId: string) => {
    setResolution({ variables: { id: matchId, winnerId, draw: false } })
  }

  const onSetDraw = (matchId: string) => {
    setResolution({ variables: { id: matchId, winnerId: null, draw: true } })
  }

  useEffect(() => {
    const view = localStorage.getItem('event-matches-view') as RoundViewMode
    view && setView(view)
  }, [])

  useEffect(() => {
    localStorage.setItem('event-matches-view', view)
  }, [view])

  const inverseViewMode = view === RoundViewMode.Grid ? RoundViewMode.List : RoundViewMode.Grid
  const toggleViewMode = () => setView(inverseViewMode)

  if (!data?.event) {
    return null
  }

  const allRoundsComplete = data.event.rounds.every((round) => round.isComplete)

  return (
    <>
      {data.event.players.totalCount === 0 && (
        <Alert variant="warning">
          No players have been added to this event yet.
        </Alert>
      )}
      <ButtonToolbar className="mb-3 d-print-none">
        {!deleted && (
          <OverlayTrigger
            show={allRoundsComplete ? false : undefined}
            trigger={['hover', 'click']}
            overlay={
              <Tooltip id="create-round">
                All previous rounds must be complete before a new round can be created.
              </Tooltip>
            }
          >
            <div>
              <CreateRoundButton
                event={data.event}
                disabled={!allRoundsComplete}
                onCreate={() => refetch()}
              />
            </div>
          </OverlayTrigger>
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} deleted
        </Button>
        <Button variant="outline-secondary" className="ms-2" onClick={toggleViewMode} title="Toggle view">
          Switch to {inverseViewMode} view
        </Button>
      </ButtonToolbar>
      <RoundList
        rounds={data.event.rounds}
        viewMode={view}
        disabled={settingResolution || deleted}
        onSetWinner={onSetWinner}
        onSetDraw={onSetDraw}
        onDelete={() => refetch()}
      />
      {data.event.rounds.length === 0 && (
        <Card body>
          <Card.Text>
            {deleted ? (
              <>No matches have been deleted from this event yet.</>
            ) : (
              <>No matches have been added to this event yet.</>
            )}
          </Card.Text>
        </Card>
      )}
    </>
  )
}
