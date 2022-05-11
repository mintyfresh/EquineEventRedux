import { gql } from '@apollo/client'
import { Card, Dropdown, ListGroup } from 'react-bootstrap'
import { RoundListFragment } from '../lib/generated/graphql'
import EllipsisDropdown from './EllipsisDropdown'

export const ROUND_LIST_FRAGMENT = gql`
  fragment RoundList on Event {
    rounds(orderBy: NUMBER, orderByDirection: DESC) {
      id
      number
      matches {
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
      }
    }
  }
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
            <EllipsisDropdown align="end" className="float-end">
              <Dropdown.Item>Edit</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
            </EllipsisDropdown>
          </Card.Header>
          <Card.Body>
            {round.matches.length > 0 ? (
              <ListGroup variant="flush">
                {round.matches.map((match) => (
                  <ListGroup.Item key={match.id}>
                    {match.player1.name} vs {match.player2?.name || 'N/A'}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Card.Text>No pairings have been added to this match yet.</Card.Text>
            )}
          </Card.Body>
        </Card>
      ))}
    </>
  )
}

export default RoundList
