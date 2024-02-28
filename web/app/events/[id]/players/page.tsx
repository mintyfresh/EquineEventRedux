'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreatePlayerButton, { CREATE_PLAYER_BUTTON_FRAGMENT } from '../../../../components/CreatePlayerButton'
import { EVENT_LAYOUT_FRAGMENT } from '../../../../components/EventLayout'
import ImportPlayersButton, { IMPORT_PLAYERS_BUTTON_FRAGMENT } from '../../../../components/ImportPlayersButton'
import PlayerTable, { PLAYER_TABLE_FRAGMENT } from '../../../../components/PlayerTable'
import { DeletedFilter, EventPlayersQuery, EventPlayersQueryVariables } from '../../../../lib/generated/graphql'

const EVENT_PLAYERS_QUERY = gql`
  query EventPlayers($id: ID!, $deleted: DeletedFilter) {
    event(id: $id) {
      id
      name
      ...EventLayout
      ...CreatePlayerButton
      ...ImportPlayersButton
      players(deleted: $deleted) {
        nodes {
          ...PlayerTable
        }
      }
    }
  }
  ${EVENT_LAYOUT_FRAGMENT}
  ${CREATE_PLAYER_BUTTON_FRAGMENT}
  ${IMPORT_PLAYERS_BUTTON_FRAGMENT}
  ${PLAYER_TABLE_FRAGMENT}
`

export default function EventPlayersPage({ params: { id } }: { params: { id: string } }) {
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch } = useQuery<EventPlayersQuery, EventPlayersQueryVariables>(EVENT_PLAYERS_QUERY, {
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined }
  })

  if (!data?.event) {
    return null
  }

  return (
    <>
      <ButtonToolbar className="mb-3 d-print-none">
        {!deleted && (
          <>
            <CreatePlayerButton event={data.event} onCreate={() => refetch()} />
            <ImportPlayersButton event={data.event} onImport={() => refetch()} className="ms-2" />
          </>
        )}
        <Button variant="outline-secondary" className="ms-auto" onClick={() => setDeleted(!deleted)}>
          {deleted ? 'Hide' : 'Show'} deleted
        </Button>
      </ButtonToolbar>
      {data.event.players.nodes.length > 0 ? (
        <PlayerTable
          players={data.event.players.nodes}
          onDelete={() => refetch()}
          onRestore={() => refetch()}
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
