import { gql } from '@apollo/client'
import { Button, ButtonGroup, Dropdown, Form, InputGroup, Modal } from 'react-bootstrap'
import { RoundCreateInput, RoundModalPlayerFragment, useGeneratePairingsForRoundLazyQuery } from '../lib/generated/graphql'

export const ROUND_MODAL_PLAYER_FRAGMENT = gql`
  fragment RoundModalPlayer on Player {
    id
    name
  }
`

gql`
  query GeneratePairingsForRound($eventId: ID!, $excludePlayerIds: [ID!]!) {
    eventProposeMatches(eventId: $eventId, excludePlayerIds: $excludePlayerIds) {
      ...RoundModalPlayer
    }
  }
  ${ROUND_MODAL_PLAYER_FRAGMENT}
`

type PlayerPairings = { [key: string]: string | null }

const buildPairings = (matches: RoundCreateInput['matches']): PlayerPairings => {
  const pairings: PlayerPairings = {}

  matches.forEach((match) => {
    match.player1Id && (pairings[match.player1Id] = match.player2Id || null)
    match.player2Id && (pairings[match.player2Id] = match.player1Id || null)
  })

  return pairings
}

const parsePairings = (pairings: PlayerPairings): RoundCreateInput['matches'] => {
  const players: Set<string> = new Set()
  const matches: RoundCreateInput['matches'] = []

  Object.keys(pairings).forEach((playerId) => {
    const player1 = playerId
    const player2 = pairings[playerId] || null

    // Skip if we've already included this pair of players
    if (players.has(player1) || (player2 && players.has(player2))) {
      return
    }

    matches.push({ player1Id: player1, player2Id: player2 })

    players.add(player1)
    player2 && players.add(player2)
  })

  return matches
}

export interface RoundModalProps {
  event: { id: string }
  players: RoundModalPlayerFragment[]
  show: boolean
  disabled: boolean
  input: RoundCreateInput
  onHide: () => void
  onChange: (input: RoundCreateInput) => void
  onSubmit: () => void
}

const RoundModal: React.FC<RoundModalProps> = ({ event, players, show, disabled, input, onHide, onChange, onSubmit }) => {
  const pairings = buildPairings(input.matches)

  const [generatePairings, {}] = useGeneratePairingsForRoundLazyQuery({
    variables: {
      eventId: event.id,
      excludePlayerIds: Object.keys(pairings).filter((playerId) => pairings[playerId])
    },
    fetchPolicy: 'no-cache',
    onCompleted: ({ eventProposeMatches }) => {
      if (eventProposeMatches) {
        const newPairings = { ...pairings }

        eventProposeMatches.forEach(([player1, player2]) => {
          player1 && (newPairings[player1.id] = player2?.id || null)
          player2 && (newPairings[player2.id] = player1?.id || null)
        })

        onChange({
          ...input,
          matches: parsePairings(newPairings)
        })
      }
    }
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

    onChange({
      ...input,
      matches: parsePairings(newPairings)
    })
  }

  const optionsForPlayer = (player: { id: string }) => {
    // Exclude the player from the list of options they can pair with
    const options  = players.filter((p) => p.id !== player.id)
    const paired   = options.filter((p) => !!pairings[p.id])
    const unpaired = options.filter((p) => !pairings[p.id])

    return (
      <>
        <option value=""></option>
        {unpaired.length > 0 && (
          <optgroup label="Unpaired">
            {unpaired.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        )}
        {paired.length > 0 && (
          <optgroup label="Paired">
            {paired.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        )}
      </>
    )
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Match Pairings</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}>
        <Modal.Body>
          <div className="d-grid gap-3">
            {players.map((player) => (
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
                  disabled={disabled}
                >
                  {optionsForPlayer(player)}
                </Form.Select>
              </InputGroup>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Dropdown as={ButtonGroup} className="me-auto">
            <Button type="button" variant="secondary" disabled={disabled} onClick={() => generatePairings()}>
              Generate Pairings
            </Button>
            <Dropdown.Toggle split variant="secondary" disabled={disabled} />
            <Dropdown.Menu align="end">
              <Dropdown.Item>Clear All</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button type="submit" disabled={disabled}>
            Save Pairings
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RoundModal
