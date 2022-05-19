import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Alert, Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreateRoundButton, { CREATE_ROUND_BUTTON_FRAGMENT } from '../../../components/CreateRoundButton'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import RoundList, { ROUND_LIST_ITEM_FRAGMENT } from '../../../components/RoundList'
import { DeletedFilter, EventMatchesQuery, EventMatchesQueryVariables, useEventMatchesQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_MATCHES_QUERY = gql`
  query EventMatches($id: ID!, $deleted: DeletedFilter) {
    event(id: $id) {
      id
      name
      ...EventLayout
      ...CreateRoundButton
      rounds(deleted: $deleted, orderBy: NUMBER, orderByDirection: DESC) {
        ...RoundListItem
      }
      players {
        totalCount
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${CREATE_ROUND_BUTTON_FRAGMENT}
  ${ROUND_LIST_ITEM_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventMatchesQuery, EventMatchesQueryVariables>({
    query: EVENT_MATCHES_QUERY,
    variables: { id: params.id as string },
    fetchPolicy: 'network-only'
  })

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      event: data.event
    }
  }
}

const EventMatchesPage: NextPageWithLayout<EventMatchesQuery> = ({ event: { id }}) => {
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch } = useEventMatchesQuery({
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined }
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      {data.event.players.totalCount === 0 && (
        <Alert variant="warning">
          No players have been added to this event yet.
        </Alert>
      )}
      <ButtonToolbar className="mb-3">
        <Button variant="outline-secondary" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} Deleted
        </Button>
        <CreateRoundButton
          event={data.event}
          onCreate={() => refetch()}
          className="ms-auto"
        />
      </ButtonToolbar>
      <RoundList
        event={data.event}
        rounds={data.event.rounds}
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
