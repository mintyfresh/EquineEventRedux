import { gql } from '@apollo/client'
import { Dropdown, ListGroup } from 'react-bootstrap'
import { ERRORS_FRAGMENT } from '../../lib/errors'
import { RoundMatchListFragment, RoundMatchListItemFragment, useSetMatchResolutionMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'
import PlayerDeletedBadge from '../Players/PlayerDeletedBadge'
import PlayerNameWithBadges, { PLAYER_NAME_WITH_BADGES_FRAGMENT } from '../Players/PlayerNameWithBadges'

gql`
  mutation SetMatchResolution($id: ID!, $winnerId: ID, $draw: Boolean!) {
    matchUpdate(id: $id, input: { winnerId: $winnerId, draw: $draw }) {
      match {
        id
        winnerId
        draw
        round {
          id
          isComplete
        }
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

export const ROUND_MATCH_LIST_ITEM_FRAGMENT = gql`
  fragment RoundMatchListItem on Match {
    id
    player1 {
      id
      ...PlayerNameWithBadges
    }
    player2 {
      id
      ...PlayerNameWithBadges
    }
    winnerId
    draw
    table
  }
  ${PLAYER_NAME_WITH_BADGES_FRAGMENT}
`

export const ROUND_MATCH_LIST_FRAGMENT = gql`
  fragment RoundMatchList on Round {
    isComplete
    matches {
      ...RoundMatchListItem
    }
  }
  ${ROUND_MATCH_LIST_ITEM_FRAGMENT}
`

export interface RoundMatchesListProps {
  round: RoundMatchListFragment
  onUpdate?: (round: RoundMatchListFragment) => void
}

const RoundMatchesList: React.FC<RoundMatchesListProps> = ({ round, onUpdate }) => {
  const [setResolution, { loading }] = useSetMatchResolutionMutation({
    onCompleted: ({ matchUpdate }) => {
      if (matchUpdate?.match?.id) {
        onUpdate?.({ ...round, ...matchUpdate.match.round })
      }
    }
  })

  const resolution = (match: RoundMatchListItemFragment) => {
    if (match.draw) {
      return ' - Draw'
    }

    if (match.winnerId) {
      return ' - Winner: ' + (match.winnerId === match.player1.id ? match.player1.name : match.player2?.name || '???')
    }

    return null
  }

  return (
    <ListGroup variant="flush">
      {round.matches.map((match) => (
        <ListGroup.Item key={match.id}>
          Table {match.table} - <PlayerNameWithBadges player={match.player1} /> vs.{' '}
          {match.player2 ? <PlayerNameWithBadges player={match.player2} /> : <span className="text-muted">No-one</span>}
          {resolution(match)}
          {match.player2 && (
            <EllipsisDropdown align="end" className="float-end d-print-none">
              <Dropdown.Header>Table {match.table}</Dropdown.Header>
              <Dropdown.Item
                disabled={loading || match.winnerId === match.player1.id}
                onClick={() => setResolution({ variables: { id: match.id, winnerId: match.player1.id, draw: false } })}
              >
                Select {match.player1.name} as winner
              </Dropdown.Item>
              <Dropdown.Item
                disabled={loading || match.winnerId === match.player2.id}
                onClick={() => match.player2 && setResolution({ variables: { id: match.id, winnerId: match.player2.id, draw: false } })}
              >
                Select {match.player2.name} as winner
              </Dropdown.Item>
              <Dropdown.Item
                disabled={loading || match.draw}
                onClick={() => setResolution({ variables: { id: match.id, winnerId: null, draw: true } })}
              >
                Mark as a draw
              </Dropdown.Item>
            </EllipsisDropdown>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}

export default RoundMatchesList
