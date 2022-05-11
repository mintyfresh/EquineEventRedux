import { gql } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Button, Form, InputGroup, Modal } from 'react-bootstrap'
import { RoundCreateInput, RoundModalPlayerFragment } from '../lib/generated/graphql'


export const ROUND_MODAL_PLAYER_FRAGMENT = gql`
  fragment RoundModalPlayer on Player {
    id
    name
  }
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
  players: RoundModalPlayerFragment[]
  show: boolean
  disabled: boolean
  input: RoundCreateInput
  onHide: () => void
  onChange: (input: RoundCreateInput) => void
  onSubmit: () => void
}

const RoundModal: React.FC<RoundModalProps> = ({ players, show, disabled, input, onHide, onChange, onSubmit }) => {
  const pairings = buildPairings(input.matches)

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
          <Button type="button" variant="secondary" className="me-auto" disabled={disabled}>
            Generate Pairings
          </Button>
          <Button type="submit" disabled={disabled}>
            Save Pairings
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RoundModal
