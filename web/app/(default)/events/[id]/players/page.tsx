'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useState } from 'react'
import { Button, ButtonToolbar, Card } from 'react-bootstrap'
import CreatePlayerButton from '../../../../../components/CreatePlayerButton'
import ImportPlayersButton from '../../../../../components/ImportPlayersButton'
import PlayerTable from '../../../../../components/PlayerTable'
import { DeletedFilter, EventPlayersDocument, EventPlayersQuery, EventPlayersQueryVariables } from '../../../../../lib/generated/graphql'

export default function EventPlayersPage({ params: { id } }: { params: { id: string } }) {
  const [deleted, setDeleted] = useState<boolean>(false)

  const { data, refetch } = useSuspenseQuery<EventPlayersQuery, EventPlayersQueryVariables>(EventPlayersDocument, {
    variables: { id, deleted: deleted ? DeletedFilter.Deleted : undefined }
  })

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
