import { gql } from '@apollo/client'
import { Card } from 'react-bootstrap'
import { RoundListItemFragment } from '../lib/generated/graphql'
import RoundControlsDropdown, { ROUND_CONTROLS_DROPDOWN_FRAGMENT } from './RoundList/RoundControlsDropdown'
import RoundMatchesList, { ROUND_MATCH_LIST_ITEM_FRAGMENT } from './RoundList/RoundMatchesList'

export const ROUND_LIST_ITEM_FRAGMENT = gql`
  fragment RoundListItem on Round {
    id
    number
    ...RoundControlsDropdown
    matches {
      id
      ...RoundMatchListItem
    }
  }
  ${ROUND_CONTROLS_DROPDOWN_FRAGMENT}
  ${ROUND_MATCH_LIST_ITEM_FRAGMENT}
`

export interface RoundListProps {
  event: { id: string }
  rounds: RoundListItemFragment[]
  onDelete?: (round: RoundListItemFragment) => void
}

const RoundList: React.FC<RoundListProps> = ({ event, rounds, onDelete }) => {
  return (
    <>
      {rounds.map((round) => (
        <Card key={round.id} className="mb-3">
          <Card.Header>
            Round {round.number}
            <RoundControlsDropdown
              event={event}
              round={round}
              onDelete={() => onDelete?.(round)}
            />
          </Card.Header>
          {round.matches.length > 0 ? (
            <RoundMatchesList matches={round.matches} />
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
