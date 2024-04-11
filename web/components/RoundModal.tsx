import { gql } from '@apollo/client'
import { useMemo } from 'react'
import { Alert, Button, ButtonGroup, ButtonToolbar, Dropdown, Form, Modal } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { MatchFormInputPlayerFragment, MatchInput, RoundUpdateInput, useGeneratePairingsMutation } from '../lib/generated/graphql'
import MatchFormInput from './MatchFormInput'

gql`
  mutation GeneratePairings($eventId: ID!, $roundId: ID) {
    eventGeneratePairings(eventId: $eventId, roundId: $roundId) {
      pairings {
        player1 {
          id
          name
        }
        player2 {
          id
          name
        }
      }
    }
  }
`

const UnpairedPlayersCounter: React.FC<{ count: number }> = ({ count }) => (
  <div className="mt-2 small text-center text-muted">
    {count === 1 ? (
      <>There is 1 player who has not yet been paired.</>
    ) : (
      <>There are {count} players who have not yet been paired.</>
    )}
  </div>
)

export interface RoundModalProps {
  title: string
  mode: 'create' | 'update'
  show: boolean
  event: { id: string }
  round: { id: string }
  input: RoundUpdateInput
  errors: Errors
  players: MatchFormInputPlayerFragment[]
  disabled?: boolean

  onHide(): void
  onInputChange(input: RoundUpdateInput): void
  onSubmit(): void
}

const calculateGaps = (matches: MatchInput[]): number[] => {
  const gaps: number[] = []

  for (let i = 0; i < matches.length; i++) {
    const currTable = matches[i].table
    const prevTable = matches[i - 1]?.table || 0

    if (currTable !== prevTable + 1) {
      for (let gap = prevTable + 1; gap < currTable; gap++) {
        gaps.push(gap)
      }
    }
  }

  return gaps
}

const RoundModal: React.FC<RoundModalProps> = ({ title, mode, show, onHide, errors, players, disabled, event, round, input, onInputChange, onSubmit }) => {
  const matches = useMemo(() => (input.matches ?? []).sort((a, b) => a.table - b.table), [input.matches])
  const gaps = useMemo(() => calculateGaps(matches), [matches])

  const pairedPlayers = useMemo(() =>
    players.filter(({ id }) => matches.some(({ player1Id, player2Id }) => player1Id === id || player2Id === id)),
    [players, matches]
  )

  const unpairedPlayers = useMemo(() =>
    players.filter(({ id }) => !matches.some(({ player1Id, player2Id }) => player1Id === id || player2Id === id)),
    [players, matches]
  )

  const generateNextTable = (after: number = 0) => {
    const finalTable = matches.reduce((acc, match) => Math.max(acc, match.table), 0)
    const nextAvailable = Math.max(after, finalTable) + 1

    return gaps
      .filter((gap) => gap > after)
      .reduce((min, gap) => Math.min(min, gap), nextAvailable)
  }

  const setMatch = (index: number, newValue: MatchInput) => {
    const oldValue = matches[index]
    const newMatches = [...matches]

    if (newValue._destroy && !newValue.id) {
      // For unpersisted matches, just remove them from the list
      newMatches.splice(index, 1)
    } else {
      newMatches[index] = newValue
    }

    // Check if one of the players has been reassigned
    if (oldValue.player1Id !== newValue.player1Id || oldValue.player2Id !== newValue.player2Id) {
      const newPlayers = [newValue.player1Id, newValue.player2Id]

      // Prevent players from being added to multiple matches
      // If they appear in another match, remove them from that match
      newMatches.forEach((match, i) => {
        if (i === index) {
          return
        }

        if (newPlayers.includes(match.player1Id)) {
          newMatches[i] = { ...match, player1Id: '' }
        }

        if (newPlayers.includes(match.player2Id)) {
          newMatches[i] = { ...match, player2Id: '' }
        }
      })
    }

    onInputChange({ ...input, matches: newMatches })
  }

  const addNewMatch = () => {
    onInputChange({
      ...input,
      matches: [
        ...matches,
        { table: generateNextTable(), player1Id: '', player2Id: '' }
      ]
    })
  }

  const clearAllMatches = () => {
    onInputChange({
      ...input,
      matches: matches
        .filter((match) => match.id) // Only keep matches that have been persisted
        .map((match) => ({ ...match, _destroy: true })) // Mark all persisted matches for deletion
    })
  }

  const [pairAllPlayers, {}] = useGeneratePairingsMutation({
    variables: {
      eventId: event.id,
      roundId: round?.id ?? null
    },
    onCompleted: ({ eventGeneratePairings }) => {
      if (eventGeneratePairings?.pairings) {
        onInputChange({
          ...input,
          matches: [
            ...matches
              .filter((match) => match.id) // Only keep persisted matches
              .map((match) => ({ ...match, _destroy: true })), // Mark all persisted matches for deletion
            ...eventGeneratePairings.pairings.map((pairing, index) => ({
              table: index + 1,
              player1Id: pairing.player1.id,
              player2Id: pairing.player2?.id
            }))
          ]
        })
      }
    }
  })

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}>
        <Modal.Body>
          {players.length === 0 && (
            <Alert variant="warning">
              There are currently no paid, active players in this event.
            </Alert> 
          )}
          {matches.map((match, index) => (
            <MatchFormInput
              key={index}
              className="mb-3"
              pairedPlayers={pairedPlayers}
              unpairedPlayers={unpairedPlayers}
              errors={errors.prefix(`matches[${index}]`)}
              input={match}
              onInputChange={(match) => setMatch(index, match)}
            />
          ))}
          <ButtonToolbar>
            <Button
              type="button"
              className="mx-auto"
              variant="outline-secondary"
              disabled={disabled}
              onClick={() => addNewMatch()}
              accessKey="a"
            >
              <u>A</u>dd Match
            </Button>
          </ButtonToolbar>
          {unpairedPlayers.length > 0 && (
            <UnpairedPlayersCounter count={unpairedPlayers.length} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar className="w-100">
            <Dropdown as={ButtonGroup}>
              <Button variant="secondary" onClick={() => pairAllPlayers()} accessKey="p">
                <u>P</u>air Players
              </Button>
              <Dropdown.Toggle split variant="secondary" />
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => clearAllMatches()}>
                  Clear All Pairings
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              type="submit"
              className="ms-auto"
              variant="primary"
              disabled={disabled}
            >
              {mode === 'create' ? 'Create' : 'Update'} Round
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RoundModal
