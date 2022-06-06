import { gql } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreatePlayerButton, { CREATE_PLAYER_BUTTON_FRAGMENT } from '../../../components/CreatePlayerButton'
import EventLayout, { EVENT_LAYOUT_FRAGMENT } from '../../../components/EventLayout'
import PlayerTable, { PLAYER_TABLE_FRAGMENT } from '../../../components/PlayerTable'
import { DeletedFilter, EventPlayersQuery, EventPlayersQueryVariables, PlayerTableFragment, useEventPlayersQuery } from '../../../lib/generated/graphql'
import { initializeApolloClient } from '../../../lib/graphql/client'
import { NextPageWithLayout } from '../../../lib/types/next-page'

const EVENT_PLAYERS_QUERY = gql`
  query EventPlayers($id: ID!, $deleted: DeletedFilter, $orderBy: EventPlayersOrderBy, $orderByDirection: OrderByDirection) {
    event(id: $id) {
      id
      name
      ...EventLayout
      ...CreatePlayerButton
      players(deleted: $deleted, orderBy: $orderBy, orderByDirection: $orderByDirection) {
        nodes {
          ...PlayerTable
        }
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${CREATE_PLAYER_BUTTON_FRAGMENT}
  ${PLAYER_TABLE_FRAGMENT}
`

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApolloClient()

  if (!params || !params.id) {
    return { notFound: true }
  }

  const { data } = await apolloClient.query<EventPlayersQuery, EventPlayersQueryVariables>({
    query: EVENT_PLAYERS_QUERY,
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

const EventPlayersPage: NextPageWithLayout<EventPlayersQuery> = ({ event: { id } }) => {
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch, variables, client } = useEventPlayersQuery({
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined },
    fetchPolicy: 'cache-and-network'
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      <ButtonToolbar className="mb-3">
        {!deleted && (
          <CreatePlayerButton event={data.event} onCreate={() => refetch()} />
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} Deleted
        </Button>
      </ButtonToolbar>
      {data.event.players.nodes.length > 0 ? (
        <PlayerTable
          players={data.event.players.nodes}
          onDelete={() => refetch()}
          onOrderBy={(orderBy, orderByDirection) => {
            if (orderBy !== variables?.orderBy || orderByDirection !== variables?.orderByDirection) {
              refetch(orderBy ? { orderBy, orderByDirection } : {})
            }
          }}
        />
      ) : (
        <Card body>
          <Card.Text>
            {deleted ? (
              <>No players have been deleted from this event yet.</>
            ) : (
              <>No players have been added to this event yet.</>
            )}
          </Card.Text>
        </Card>
      )}
    </>
  )
}

EventPlayersPage.getLayout = (page: React.ReactElement<EventPlayersQuery>) => (
  <EventLayout event={page.props.event}>
    {page}
  </EventLayout>
)

export default EventPlayersPage
