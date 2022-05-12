import { gql } from '@apollo/client'
import { ListGroup } from 'react-bootstrap'
import { RoundMatchListItemFragment } from '../../lib/generated/graphql'

export const ROUND_MATCH_LIST_ITEM_FRAGMENT = gql`
  fragment RoundMatchListItem on Match {
    id
    player1 {
      id
      name
    }
    player2 {
      id
      name
    }
    winnerId
    draw
    table
  }
`

export interface RoundMatchesListProps {
  matches: RoundMatchListItemFragment[]
}

const RoundMatchesList: React.FC<RoundMatchesListProps> = ({ matches }) => (
  <ListGroup variant="flush">
    {matches.map((match) => (
      <ListGroup.Item key={match.id}>
        Table {match.table} - {match.player1.name} vs. {match.player2?.name || 'N/A'}
        {match.winnerId || match.draw && (
          <>
            - Winner: {match.draw ? 'Draw' : (
              match.winnerId == match.player1.id ? match.player1.name : match.player2?.name
            )}
          </>
        )}
      </ListGroup.Item>
    ))}
  </ListGroup>
)

export default RoundMatchesList
