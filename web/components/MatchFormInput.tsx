import { gql } from '@apollo/client'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Errors } from '../lib/errors'
import { MatchFormInputPlayerFragment, MatchInput } from '../lib/generated/graphql'

const optionsForPlayers = (players: MatchFormInputPlayerFragment[]) => (
  <>
    {players.map((player) => (
      <option key={player.id} value={player.id}>{player.name}</option>
    ))}
  </>
)

const PlayerSelect: React.FC<{
  title: string,
  value: string,
  pairedPlayers: MatchFormInputPlayerFragment[],
  unpairedPlayers: MatchFormInputPlayerFragment[],
  onChange(value: string): void
}> = ({ title, value, pairedPlayers, unpairedPlayers, onChange }) => {
  return (
    <Form.Select
      title={title}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      <option value=""></option>
      {pairedPlayers.length > 0 && (
        <optgroup label="Paired">
          {optionsForPlayers(pairedPlayers)}
        </optgroup>
      )}
      {unpairedPlayers.length > 0 && (
        <optgroup label="Unpaired">
          {optionsForPlayers(unpairedPlayers)}
        </optgroup>
      )}
    </Form.Select>
  )
}

export const MATCH_FORM_INPUT_PLAYER_FRAGMENT = gql`
  fragment MatchFormInputPlayer on Player {
    id
    name
  }
`

export interface MatchFormInputProps extends React.ComponentProps<typeof Row> {
  errors: Errors
  pairedPlayers: MatchFormInputPlayerFragment[]
  unpairedPlayers: MatchFormInputPlayerFragment[]
  input: MatchInput

  onInputChange(input: MatchInput): void
}

const MatchFormInput: React.FC<MatchFormInputProps> = ({ errors, pairedPlayers, unpairedPlayers, input, onInputChange, ...props }) => {
  const onDelete = () => {
    onInputChange({ ...input, _destroy: true })
  }

  const onRestore = () => {
    onInputChange({ ...input, _destroy: undefined })
  }

  return (
    <Row {...props}>
      <Form.Group as={Col}>
        <Form.Label>Table</Form.Label>
        <Form.Control
          type="number"
          title="Table"
          value={input.table}
          onChange={(event) => onInputChange({ ...input, table: +event.target.value })}
        />
      </Form.Group>
      <Form.Group as={Col}>
        <Form.Label>Player 1</Form.Label>
        <PlayerSelect
          title="Player 1"
          value={input.player1Id}
          pairedPlayers={pairedPlayers.filter(({ id }) => input.player2Id !== id)}
          unpairedPlayers={unpairedPlayers}
          onChange={(value) => onInputChange({ ...input, player1Id: value })}
        />
      </Form.Group>
      <Form.Group as={Col}>
        <Form.Label>Player 2</Form.Label>
        <PlayerSelect
          title="Player 2"
          value={input.player2Id ?? ''}
          pairedPlayers={pairedPlayers.filter(({ id }) => input.player1Id !== id)}
          unpairedPlayers={unpairedPlayers}
          onChange={(value) => onInputChange({ ...input, player2Id: value })}
        />
      </Form.Group>
      <Col xs="auto" className="mt-auto">
        {input._destroy ? (
          <Button variant="secondary" onClick={onRestore}>
            Restore
          </Button>
        ) : (
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
      </Col>
    </Row>
  )
}

export default MatchFormInput
