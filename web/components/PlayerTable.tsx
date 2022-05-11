import { gql } from '@apollo/client'
import { Badge, Table } from 'react-bootstrap'
import { PlayerTableFragment } from '../lib/generated/graphql'
import PlayerActionsDropdown, { PLAYER_ACTIONS_DROPDOWN_FRAGMENT } from './PlayerTable/PlayerActionsDropdown'

export const PLAYER_TABLE_FRAGMENT = gql`
  fragment PlayerTable on Player {
    id
    name
    paid
    dropped
    winsCount
    drawsCount
    lossesCount
    score
    ...PlayerActionsDropdown
  }
  ${PLAYER_ACTIONS_DROPDOWN_FRAGMENT}
`

const UnpaidBadge: React.FC<React.ComponentPropsWithoutRef<typeof Badge>> = (props) => (
  <Badge {...props} bg="warning" pill>unpaid</Badge>
)

const DroppedBadge: React.FC<React.ComponentPropsWithoutRef<typeof Badge>> = (props) => (
  <Badge {...props} bg="danger" pill>dropped</Badge>
)

export interface PlayerTableProps {
  players: PlayerTableFragment[]
  onDelete?: (player: PlayerTableFragment) => void
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onDelete }) => (
  <Table variant="stripped">
    <thead>
      <tr>
        <th>Name</th>
        <th>Wins</th>
        <th>Draws</th>
        <th>Losses</th>
        <th>Points</th>
        <th className="text-end">Actions</th>
      </tr>
    </thead>
    <tbody>
      {players.map((player) => (
        <tr key={player.id}>
          <td>
            {player.name}
            {player.paid || <UnpaidBadge className="ms-1" />}
            {player.dropped && <DroppedBadge className="ms-1" />}
          </td>
          <td>{player.winsCount}</td>
          <td>{player.drawsCount}</td>
          <td>{player.lossesCount}</td>
          <td>{player.score}</td>
          <td className="text-end">
            <PlayerActionsDropdown player={player} onDelete={() => onDelete?.(player)} />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
)

export default PlayerTable
