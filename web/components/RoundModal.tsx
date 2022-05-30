import { Button, ButtonToolbar, Form, Modal } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { MatchFormInputPlayerFragment, MatchInput, RoundInput } from '../lib/generated/graphql'
import MatchFormInput from './MatchFormInput'

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
  const matches = input.matches ?? []

  const setMatch = (index: number, match: MatchInput) => {
    const newMatches = [...matches]

    if (match._destroy && !match.id) {
      // For unpersisted matches, just remove them from the list
      newMatches.splice(index, 1)
    } else {
      const newPlayers = [match.player1Id, match.player2Id]

      newMatches[index] = match

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
        { table: matches.length + 1, player1Id: '', player2Id: '' }
      ]
    })
  }

  const pairedPlayers   = players.filter(({ id }) => matches.some(({ player1Id, player2Id }) => player1Id === id || player2Id === id))
  const unpairedPlayers = players.filter(({ id }) => !matches.some(({ player1Id, player2Id }) => player1Id === id || player2Id === id))

  return (
    <Modal show={show} onHide={onHide}>
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
              errors={errors}
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
