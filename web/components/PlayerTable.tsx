import { gql } from '@apollo/client'
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Header, SortingState, Table, useReactTable } from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'
import { Badge, Table as BSTable } from 'react-bootstrap'
import NumberFormat from 'react-number-format'
import { PlayerTableFragment } from '../lib/generated/graphql'
import PlayerNameWithBadges, { PLAYER_NAME_WITH_BADGES_FRAGMENT } from './Players/PlayerNameWithBadges'
import PlayerActionsDropdown, { PLAYER_ACTIONS_DROPDOWN_FRAGMENT } from './PlayerTable/PlayerActionsDropdown'

export const PLAYER_TABLE_FRAGMENT = gql`
  fragment PlayerTable on Player {
    id
    name
    winsCount
    drawsCount
    lossesCount
    score
    opponentWinRate
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
        {icon && <FontAwesomeIcon icon={icon} className="ms-2" />}
        {displaySortIndex && <Badge bg="secondary" className="ms-2">{header.column.getSortIndex() + 1}</Badge>}
      </div>
    </th>
  )
}

export interface PlayerTableProps {
  players: PlayerTableFragment[]
  onDelete?: (player: PlayerTableFragment) => void
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onDelete }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'score', desc: true },
    { id: 'opponentWinRate', desc: true }
  ])

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
      id: 'actions',
      header: () => (
        <span className="float-end">
          Actions
        </span>
      ),
      cell: ({ row }) => (
        <span className="float-end">
          <PlayerActionsDropdown
            player={row.original}
            onDelete={() => onDelete?.(row.original)}
          />
        </span>
      )
    }
  ], [onDelete])

  const table = useReactTable({
    data: players,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <BSTable variant="stripped">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
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
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
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
