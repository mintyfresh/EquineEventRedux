import { Button, ButtonToolbar, Form, Modal } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { MatchFormInputPlayerFragment, MatchInput, RoundInput } from '../lib/generated/graphql'
import MatchFormInput from './MatchFormInput'

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
  show: boolean
  input: RoundInput
  errors: Errors
  players: MatchFormInputPlayerFragment[]
  disabled?: boolean

  onHide(): void
  onInputChange(input: RoundInput): void
  onSubmit(): void
}

const RoundModal: React.FC<RoundModalProps> = ({ title, show, onHide, errors, players, disabled, input, onInputChange, onSubmit }) => {
  const matches = (input.matches ?? []).sort((a, b) => a.table - b.table)

  const generateNextTable = () => {
    if (matches.length === 0) {
      return 1
    }

    // Fill in any gaps in the table numbers
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].table !== i + 1) {
        return i + 1
      }
    }

    // Allocate a new table at the end of the list
    return matches[matches.length - 1].table + 1
  }

  const setMatch = (index: number, match: MatchInput) => {
    const newMatches = [...matches]

    if (match._destroy && !match.id) {
      // For unpersisted matches, just remove them from the list
      newMatches.splice(index, 1)
    } else {
      newMatches[index] = match
    }

    if (matches[index].player1Id !== match.player1Id || matches[index].player2Id !== match.player2Id) {
      const newPlayers = [match.player1Id, match.player2Id]

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

  const pairedPlayers   = players.filter(({ id }) => matches.some(({ player1Id, player2Id }) => player1Id === id || player2Id === id))
  const unpairedPlayers = players.filter(({ id }) => !matches.some(({ player1Id, player2Id }) => player1Id === id || player2Id === id))

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
              onClick={addNewMatch}
            >
              Add Match
            </Button>
          </ButtonToolbar>
          {unpairedPlayers.length > 0 && (
            <UnpairedPlayersCounter count={unpairedPlayers.length} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button
              type="submit"
              className="ms-auto"
              variant="primary"
              disabled={disabled}
            >
              Save
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RoundModal
