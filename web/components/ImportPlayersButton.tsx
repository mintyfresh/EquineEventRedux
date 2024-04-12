import { gql } from '@apollo/client'
import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { ImportPlayersButtonFragment, useImportPlayersMutation } from '../lib/generated/graphql'
import PlayerImportModal from './PlayerImportModal/PlayerImportModal'

export const IMPORT_PLAYERS_BUTTON_FRAGMENT = gql`
  fragment ImportPlayersButton on Event {
    id
    ...PlayerImportModalEvent
  }
`

gql`
  mutation ImportPlayers($input: PlayerImportBulkInput!) {
    playerImportBulk(input: $input) {
      event {
        id
        ...ImportPlayersButton
      }
    }
  }
  ${IMPORT_PLAYERS_BUTTON_FRAGMENT}
`

export interface ImportPlayersButtonProps extends React.ComponentProps<typeof Button> {
  event: ImportPlayersButtonFragment
  onImport: () => void
}

const ImportPlayersButton: React.FC<ImportPlayersButtonProps> = ({ event, onImport, ...props }) => {
  const [show, setShow] = useState(false)
  const [importPlayers] = useImportPlayersMutation({
    onCompleted: ({ playerImportBulk }) => {
      playerImportBulk?.event && onImport()
      setShow(false)
    }
  })

  return (
    <>
      <Button
        variant="secondary"
        {...props}
        onClick={() => setShow(true)}
      >
        Import players from past event
      </Button>
      <PlayerImportModal
        show={show}
        onHide={() => setShow(false)}
        event={event}
        onImport={(players, markAsPaid) => {
          importPlayers({
            variables: {
              input: {
                eventId: event.id,
                playerNames: players.map(({ name }) => name),
                paid: markAsPaid
              }
            }
          })
        }}
      />
    </>
  )
}

export default ImportPlayersButton
