import { gql } from '@apollo/client'
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Header, SortingState, Table, useReactTable } from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'
import { Badge, Table as BSTable } from 'react-bootstrap'
import NumberFormat from 'react-number-format'
import { PlayerTableEventFragment, PlayerTableFragment } from '../../lib/generated/graphql'
import PlayerNameWithBadges, { PLAYER_NAME_WITH_BADGES_FRAGMENT } from '../Players/PlayerNameWithBadges'
import PlayerActionsDropdown, { PLAYER_ACTIONS_DROPDOWN_FRAGMENT } from './PlayerActionsDropdown'

export const PLAYER_TABLE_FRAGMENT = gql`
  fragment PlayerTable on Player {
    id
    name
    winsCount
    lossesCount
    opponentWinRate
    ...on SwissPlayer {
      drawsCount
      score
    }
    ...on SingleEliminationPlayer {
      ranking: swissRanking
    }
    ...PlayerNameWithBadges
    ...PlayerActionsDropdown
  }
  ${PLAYER_NAME_WITH_BADGES_FRAGMENT}
  ${PLAYER_ACTIONS_DROPDOWN_FRAGMENT}
`

const PlayerTableHeader: React.FC<{ table: Table<PlayerTableFragment>, header: Header<PlayerTableFragment, unknown> }> = ({ table, header }) => {
  if (header.isPlaceholder) {
    return (
      <th></th>
    )
  }

  const content = flexRender(
    header.column.columnDef.header,
    header.getContext()
  )

  if (!header.column.getCanSort()) {
    return (
      <th>{content}</th>
    )
  }

  const displaySortIndex =
    header.column.getSortIndex() >= 0 &&
    table.getState().sorting.length > 0

  const icon = header.column.getIsSorted()
    ? header.column.getIsSorted() === 'asc'
      ? faSortUp
      : faSortDown
    : null

  return (
    <th>
      <div role="button" className="user-select-none" onClick={header.column.getToggleSortingHandler()}>
        {content}
        {icon && <FontAwesomeIcon icon={icon} className="ms-2 d-print-none" />}
        {displaySortIndex && <Badge bg="secondary" className="ms-2 d-print-none">{header.column.getSortIndex() + 1}</Badge>}
      </div>
    </th>
  )
}

export interface PlayerTableProps {
  event: PlayerTableEventFragment
  players: PlayerTableFragment[]
  onDelete?: (player: PlayerTableFragment) => void
  onRestore?: (player: PlayerTableFragment) => void
}

const PlayerTable: React.FC<PlayerTableProps> = ({ event, players, onDelete, onRestore }) => {
  const [sorting, setSorting] = useState<SortingState>(
    event.__typename === 'SwissEvent' ? [
      { id: 'score', desc: true },
      { id: 'opponentWinRate', desc: true },
      { id: 'id', desc: true }
    ] : [
      { id: 'winsCount', desc: true },
      { id: 'ranking', desc: false }, // default to 'asc' for ranking
      { id: 'id', desc: true }
    ]
  )

  const columns: ColumnDef<PlayerTableFragment>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <PlayerNameWithBadges player={row.original} />
      )
    },
    {
      accessorKey: 'winsCount',
      header: 'Wins'
    },
    {
      accessorKey: 'drawsCount',
      header: 'Draws'
    },
    {
      accessorKey: 'lossesCount',
      header: 'Losses'
    },
    {
      accessorKey: 'score',
      header: 'Points'
    },
    {
      accessorKey: 'opponentWinRate',
      header: 'Opponent Win Rate',
      cell: ({ row }) => (
        <NumberFormat
          suffix="%"
          displayType="text"
          decimalScale={2}
          value={row.original.opponentWinRate * 100}
        />
      )
    },
    {
      accessorKey: 'ranking',
      header: 'Ranking'
    },
    {
      accessorKey: 'id',
      header: 'Player ID',
      enableHiding: true
    },
    {
      id: 'actions',
      header: () => (
        <span className="float-end d-print-none">
          Actions
        </span>
      ),
      cell: ({ row }) => (
        <span className="float-end d-print-none">
          <PlayerActionsDropdown
            player={row.original}
            onDelete={() => onDelete?.(row.original)}
            onRestore={() => onRestore?.(row.original)}
          />
        </span>
      )
    }
  ], [event.__typename, onDelete, onRestore])

  const table = useReactTable({
    data: players,
    columns,
    state: {
      sorting,
      columnVisibility: {
        'id': false,
        // fields only applicable to Swiss events
        'drawsCount': event.__typename === 'SwissEvent',
        'score': event.__typename === 'SwissEvent',
        'opponentWinRate': event.__typename === 'SwissEvent',
        // fields only applicable to single elimination events
        'ranking': event.__typename === 'SingleEliminationEvent'
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <BSTable variant="stripped">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            <th>Ranking</th>
            {headerGroup.headers.map((header) => (
              <PlayerTableHeader
                key={header.id}
                table={table}
                header={header}
              />
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row, index) => (
          <tr key={row.id}>
            <td>#{index + 1}</td>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </BSTable>
  )
}

export default PlayerTable
