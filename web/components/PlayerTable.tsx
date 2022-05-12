import { gql } from '@apollo/client'
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { Badge, Table } from 'react-bootstrap'
import { EventPlayersOrderBy, OrderByDirection, PlayerTableFragment } from '../lib/generated/graphql'
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
    opponentWinRate
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
  onOrderBy?: (orderBy: EventPlayersOrderBy, orderByDirection: OrderByDirection) => void
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onDelete, onOrderBy }) => {
  const [orderBy, setOrderBy] = useState<EventPlayersOrderBy>(EventPlayersOrderBy.Name)
  const [orderByDirection, setOrderByDirection] = useState<OrderByDirection>(OrderByDirection.Asc)

  const OrderableHeader: React.FC<{ children: React.ReactNode, orderBy: EventPlayersOrderBy }> = ({ children, ...props }) => {
    const icon = orderBy === props.orderBy ? (
      orderByDirection === OrderByDirection.Asc ? faSortUp : faSortDown
    ) : (
      faSort
    );

    return (
      <th role="button" className="user-select-none" onClick={() => {
        if (orderBy === props.orderBy) {
          setOrderByDirection(orderByDirection === OrderByDirection.Asc ? OrderByDirection.Desc : OrderByDirection.Asc)
        } else {
          setOrderBy(props.orderBy)
          setOrderByDirection(OrderByDirection.Asc)
        }
      }}>
        {children}
        <FontAwesomeIcon icon={icon} className="ms-2" />
      </th>
    )
  }

  useEffect(() => {
    onOrderBy?.(orderBy, orderByDirection)
  }, [orderBy, orderByDirection])

  return (
    <Table variant="stripped">
      <thead>
        <tr>
          <OrderableHeader orderBy={EventPlayersOrderBy.Name}>Name</OrderableHeader>
          <OrderableHeader orderBy={EventPlayersOrderBy.WinsCount}>Wins</OrderableHeader>
          <OrderableHeader orderBy={EventPlayersOrderBy.DrawsCount}>Draws</OrderableHeader>
          <OrderableHeader orderBy={EventPlayersOrderBy.LossesCount}>Losses</OrderableHeader>
          <OrderableHeader orderBy={EventPlayersOrderBy.Score}>Points</OrderableHeader>
          <th>Opponent Win Rate</th>
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
            <td>{player.opponentWinRate}</td>
            <td className="text-end">
              <PlayerActionsDropdown player={player} onDelete={() => onDelete?.(player)} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default PlayerTable
