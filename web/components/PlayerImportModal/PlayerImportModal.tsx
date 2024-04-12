import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { PlayerImportModalEventFragment, PlayerImportModalEventListDocument, PlayerImportModalEventListItemFragment, PlayerImportModalEventListQuery, PlayerImportModalEventListQueryVariables, PlayerImportModelEventPlayersDocument, PlayerImportModelEventPlayersQuery, PlayerImportModelEventPlayersQueryVariables, PlayerSelectListItemFragment } from '../../lib/generated/graphql'
import PlayerSelectList from '../PlayerSelectList/PlayerSelectList'

export interface PlayerImportModalProps extends React.ComponentProps<typeof Modal> {
  event: PlayerImportModalEventFragment
  onImport?(players: PlayerSelectListItemFragment[], markAsPaid: boolean): void
}

export default function PlayerImportModal({ event, show, onImport, ...props }: PlayerImportModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<PlayerImportModalEventListItemFragment | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSelectListItemFragment[]>([])
  const [markAsPaid, setMarkAsPaid] = useState(true)

  const { data: eventsData, loading } = useQuery<PlayerImportModalEventListQuery, PlayerImportModalEventListQueryVariables>(
    PlayerImportModalEventListDocument,
    {
      skip: !show,
      fetchPolicy: 'cache-and-network'
    }
  )

  const { data: playersData } = useQuery<PlayerImportModelEventPlayersQuery, PlayerImportModelEventPlayersQueryVariables>(
    PlayerImportModelEventPlayersDocument,
    {
      skip: !selectedEvent,
      variables: { eventId: selectedEvent?.id ?? '' },
      fetchPolicy: 'cache-and-network'
    }
  )

  useEffect(() => {
    if (!show) {
      // reset state when modal is hidden
      setSelectedEvent(null)
      setSelectedPlayers([])
      setMarkAsPaid(true)
    }
  }, [show])

  useEffect(() => {
    setSelectedPlayers([]) // clear selected players when event changes
  }, [selectedEvent])

  const sourceEvents = eventsData ? eventsData.events.nodes : []
  const activeSourceEvents = sourceEvents.filter(({ deleted }) => !deleted)
  const deletedSourceEvents = sourceEvents.filter(({ deleted }) => deleted)

  const onSelect = (eventId: string | undefined) => {
    setSelectedEvent(eventId ? sourceEvents.find(({ id }) => id === eventId) ?? null : null)
  }

  const playerAlreadyExists = (player: PlayerSelectListItemFragment) => (
    event.allPlayers.nodes.some(({ name }) => name === player.name)
  )

  return (
    <Modal show={show} {...props}>
      <Modal.Header closeButton>
        <Modal.Title>Import players from existing event</Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          onImport?.(selectedPlayers, markAsPaid)
        }}
      >
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Source event</Form.Label>
            <Form.Select
              disabled={loading}
              onChange={(event) => onSelect(event.currentTarget.value)}
            >
              <option>{loading && 'Loading events...'}</option>
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
          {playersData?.event.players && (
            <Form.Group>
              <Form.Label>
                Players to Import
              </Form.Label>
              <PlayerSelectList
                players={playersData.event.players.nodes}
                selected={selectedPlayers}
                canSelect={(player) => !playerAlreadyExists(player)}
                onChange={setSelectedPlayers}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Form.Check
            type="checkbox"
            label="Mark as paid"
            checked={markAsPaid}
            onChange={(event) => setMarkAsPaid(event.currentTarget.checked)}
            className="me-auto"
          />
          <Button type="submit">
            Import players
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
