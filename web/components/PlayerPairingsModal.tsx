import { gql } from '@apollo/client'
import { useState } from 'react'
import { Button, Form, InputGroup, Modal } from 'react-bootstrap'
import { usePlayersForPairingsQuery } from '../lib/generated/graphql'

gql`
  query PlayersForPairings($id: ID!) {
    event(id: $id) {
      id
      players(activeOnly: true) {
        nodes {
          id
          name
        }
      }
    }
  }
`

export interface PlayerPairingsModalProps {
  event: { id: string }
  show: boolean
  onHide: () => void
}

const PlayerPairingsModal: React.FC<PlayerPairingsModalProps> = ({ event, show, onHide }) => {
  const [pairings, setPairings] = useState<{ [key: string]: string | null }>({})

  const { data, loading } = usePlayersForPairingsQuery({
    variables: { id: event.id }
  })

  const createPairing = (player: string, newValue: string | null) => {
    const newPairings = { ...pairings }

    Object.keys(newPairings).forEach((key) => {
      // Remove any pairings that are for the same player
      if (newPairings[key] === player || newPairings[key] === newValue) {
        newPairings[key] = null
      }
    })

    newPairings[player] = newValue

    if (newValue) {
      newPairings[newValue] = player
    }

    setPairings(newPairings)
  }

  if (loading || !data?.event) {
    return null
  }

  const optionsForPlayer = (player: { id: string }) => (
    data.event.players.nodes.filter((p) => p.id !== player.id)
  )

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Match Pairings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-grid gap-3">
          {data.event.players.nodes.map((player) => (
            <InputGroup key={player.id}>
              <Form.Control
                type="text"
                value={player.name}
                readOnly
              />
              <InputGroup.Text>
                vs.
              </InputGroup.Text>
              <Form.Select
                value={pairings[player.id] || ''}
                onChange={(event) => createPairing(player.id, event.currentTarget.value)}
              >
                <option value=""></option>
                {optionsForPlayer(player).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" className="me-auto">
          Generate Pairings
        </Button>
        <Button type="submit">
          Save Pairings
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PlayerPairingsModal
