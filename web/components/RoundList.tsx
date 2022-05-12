import { gql } from '@apollo/client'
import { Card } from 'react-bootstrap'
import { RoundListFragment } from '../lib/generated/graphql'
import RoundControlsDropdown from './RoundList/RoundControlsDropdown'
import RoundMatchesList, { ROUND_MATCH_LIST_ITEM_FRAGMENT } from './RoundList/RoundMatchesList'

export const ROUND_LIST_FRAGMENT = gql`
  fragment RoundList on Event {
    rounds(orderBy: NUMBER, orderByDirection: DESC) {
      id
      number
      matches {
        id
        ...RoundMatchListItem
      }
    }
  }
  ${ROUND_MATCH_LIST_ITEM_FRAGMENT}
`

export interface RoundListProps {
  rounds: RoundListFragment['rounds']
}

const RoundList: React.FC<RoundListProps> = ({ rounds }) => {
  return (
    <>
      {rounds.map((round) => (
        <Card key={round.id} className="mb-3">
          <Card.Header>
            Round {round.number}
            <RoundControlsDropdown />
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
