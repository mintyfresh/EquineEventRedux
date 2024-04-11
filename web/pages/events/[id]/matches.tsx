import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import { Alert, Button, ButtonToolbar, Card, OverlayTrigger, Tooltip } from 'react-bootstrap'
import EventLayout from '../../../components/EventLayout'
import RoundList from '../../../components/RoundList'
import { RoundViewMode } from '../../../components/RoundList/RoundListItem'
import { DeletedFilter, EventMatchesDocument, EventMatchesQuery, EventMatchesQueryVariables, useEventMatchesQuery, useSetMatchResolutionMutation } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'
import CreateRoundDropdown from '../../../components/CreateRoundDropdown/CreateRoundDropdown'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventMatchesQuery, EventMatchesQueryVariables>({
    query: EventMatchesDocument,
    variables: { id: params.id as string, deleted: undefined },
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

const EventMatchesPage: NextPageWithLayout<{ id: string }> = ({ id }) => {
  const [view, setView] = useState<RoundViewMode>(RoundViewMode.Grid)
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch } = useEventMatchesQuery({
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined }
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
              <CreateRoundDropdown
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

EventMatchesPage.getLayout = (page: React.ReactElement<EventMatchesQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventMatchesPage
