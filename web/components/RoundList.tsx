import { gql } from '@apollo/client'
import { Card } from 'react-bootstrap'
import { RoundListItemFragment } from '../lib/generated/graphql'
import RoundControlsDropdown, { ROUND_CONTROLS_DROPDOWN_FRAGMENT } from './RoundList/RoundControlsDropdown'
import RoundMatchesList, { ROUND_MATCH_LIST_FRAGMENT } from './RoundList/RoundMatchesList'

export const ROUND_LIST_ITEM_FRAGMENT = gql`
  fragment RoundListItem on Round {
    id
    number
    ...RoundControlsDropdown
    ...RoundMatchList
  }
  ${ROUND_CONTROLS_DROPDOWN_FRAGMENT}
  ${ROUND_MATCH_LIST_FRAGMENT}
`

export interface RoundListProps {
  event: { id: string }
  rounds: RoundListItemFragment[]
  disabled?: boolean
  onSetWinner?: (matchId: string, winnerId: string) => void
  onSetDraw?: (matchId: string) => void
  onDelete?: (round: RoundListItemFragment) => void
}

const RoundList: React.FC<RoundListProps> = ({ event, rounds, disabled, onSetWinner, onSetDraw, onDelete }) => {
  return (
    <>
      {rounds.map((round) => (
        <Card key={round.id} className="mb-3" style={{ breakInside: 'avoid' }}>
          <Card.Header>
            Round {round.number}
            <RoundControlsDropdown
              event={event}
              round={round}
              onDelete={() => onDelete?.(round)}
            />
          </Card.Header>
          {round.matches.length > 0 ? (
            <RoundMatchesList
              round={round}
              disabled={disabled}
              onSetWinner={onSetWinner}
              onSetDraw={onSetDraw}
            />
          ) : (
            <Card.Body>
              <Card.Text>No pairings have been added to this match yet.</Card.Text>
            </Card.Body>
          )}
        </Card>
      ))}
    </>
  )
}

export default RoundList
