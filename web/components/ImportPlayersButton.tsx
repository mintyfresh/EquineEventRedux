import { gql } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { ImportPlayersButtonFragment, PlayerForImportFragment, SourceEventForImportFragment, useImportPlayersMutation, useSourceEventsForImportLazyQuery } from '../lib/generated/graphql'
import PlayerDeletedBadge from './Players/PlayerDeletedBadge'

const PLAYER_FOR_IMPORT_FRAGMENT = gql`
  fragment PlayerForImport on Player {
    id
    name
    deleted
  }
`

const SOURCE_EVENT_FOR_IMPORT_FRAGMENT = gql`
  fragment SourceEventForImport on Event {
    id
    name
    deleted
    players(orderBy: SCORE, orderByDirection: DESC) {
      nodes {
        ...PlayerForImport
      }
    }
  }
  ${PLAYER_FOR_IMPORT_FRAGMENT}
`

gql`
  query SourceEventsForImport {
    events {
      nodes {
        ...SourceEventForImport
      }
    }
  }
  ${SOURCE_EVENT_FOR_IMPORT_FRAGMENT}
`

export const IMPORT_PLAYERS_BUTTON_FRAGMENT = gql`
  fragment ImportPlayersButton on Event {
    id
    allPlayers: players {
      nodes {
        id
        name
        deleted
      }
    }
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

const ImportPlayersButton: React.FC<ImportPlayersButtonProps> = ({ event, onImport, ...buttonProps }) => {
  const [show, setShow] = useState(false)
  const [sourceEvent, setSourceEvent] = useState<SourceEventForImportFragment | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerForImportFragment[]>([])
  const [markAsPaid, setMarkAsPaid] = useState(true)

  const [loadSourceEvents, { data, loading: loadingEvents }] = useSourceEventsForImportLazyQuery()
  const [importPlayers] = useImportPlayersMutation({
    variables: {
      input: {
        eventId: event.id,
        playerNames: selectedPlayers.map(({ name }) => name),
        paid: markAsPaid
      }
    },
    onCompleted: ({ playerImportBulk }) => {
      playerImportBulk?.event && onImport()
      setShow(false)
    }
  })

  useEffect(() => {
    if(show) {
      loadSourceEvents()
    } else {
      setSourceEvent(null)
      setSelectedPlayers([])
    }
  }, [show, loadSourceEvents])

  const sourceEvents = data ? data.events.nodes : []
  const activeSourceEvents = sourceEvents.filter(({ deleted }) => !deleted)
  const deletedSourceEvents = sourceEvents.filter(({ deleted }) => deleted)

  const playerAlreadyExists = (player: PlayerForImportFragment) => (
    event.allPlayers.nodes.some(({ name }) => name === player.name)
  )

  const setPlayerSelected = (player: PlayerForImportFragment, selected: boolean) => {
    if (selected) {
      setSelectedPlayers([...selectedPlayers, player])
    } else {
      setSelectedPlayers(selectedPlayers.filter(({ id }) => id !== player.id))
    }
  }

  const selectAll = () => {
    setSelectedPlayers(sourceEvent?.players.nodes ?? [])
  }

  const selectNone = () => {
    setSelectedPlayers([])
  }

  return (
    <>
      <Button
        variant="secondary"
        {...buttonProps}
        onClick={() => setShow(true)}
        disabled={loadingEvents || buttonProps.disabled}
      >
        Import players from past event
      </Button>
      <Modal
        show={show && !loadingEvents}
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import Players from Past Event</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(event) => {
            event.preventDefault()
            importPlayers()
          }}
        >
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Past Event
              </Form.Label>
              <Form.Select
                onChange={(event) => {
                  setSourceEvent(sourceEvents.find(({ id }) => id === event.currentTarget.value) ?? null)
                }}
              >
                <option></option>
                <optgroup label="Events">
                  {activeSourceEvents.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                  {activeSourceEvents.length === 0 && (
                    <option disabled>No events</option>
                  )}
                </optgroup>
                {deletedSourceEvents.length > 0 && (
                  <optgroup label="Deleted Events">
                    {deletedSourceEvents.map((event) => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </optgroup>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              {sourceEvent && (
                <>
                  <Form.Label>
                    Players to Import
                  </Form.Label>
                  {sourceEvent.players.nodes.map((player, index) => (
                    <Form.Check
                      key={player.id}
                      id={`player-check-${player.id}`}
                      label={(
                        <>
                          #{index + 1} -{' '}
                          {player.name}
                          {player.deleted && <PlayerDeletedBadge className="ms-1" />}
                        </>
                      )}
                      checked={selectedPlayers.includes(player)}
                      onChange={(event) => setPlayerSelected(player, event.currentTarget.checked)}
                      disabled={playerAlreadyExists(player)}
                    />
                  ))}
                  <p className="mb-2">
                    {selectedPlayers.length} players selected
                  </p>
                  <div>
                    <Button size="sm" onClick={selectAll}>
                      Select all
                    </Button>
                    <Button size="sm" onClick={selectNone} className="ms-2">
                      Select none
                    </Button>
                  </div>
                </>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Form.Check
                type="checkbox"
                label="Mark all as Paid"
                checked={markAsPaid}
                onChange={(event) => setMarkAsPaid(event.currentTarget.checked)}
                className="me-auto"
              />
            <Button type="submit">Import Players</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default ImportPlayersButton
