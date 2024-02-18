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
  onComplete?: (round: RoundListItemFragment) => void
  onDelete?: (round: RoundListItemFragment) => void
}

const RoundList: React.FC<RoundListProps> = ({ event, rounds, onComplete, onDelete }) => {
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
              onUpdate={(update) => {
                if (update.isComplete && !round.isComplete) {
                  onComplete?.(round)
                }
              }}
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
