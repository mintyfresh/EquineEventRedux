import { Button, Form } from 'react-bootstrap'
import { PlayerSelectListItemFragment } from '../../lib/generated/graphql'
import PlayerDeletedBadge from '../Players/PlayerDeletedBadge'

export interface PlayerSelectListProps {
  players: PlayerSelectListItemFragment[]
  selected: PlayerSelectListItemFragment[]
  canSelect(player: PlayerSelectListItemFragment): boolean
  onChange(players: PlayerSelectListItemFragment[]): void
}

export default function PlayerSelectList({ players, selected, canSelect, onChange }: PlayerSelectListProps) {
  const setPlayerSelected = (player: PlayerSelectListItemFragment, value: boolean) => {
    if (value) {
      onChange([...selected, player])
    } else {
      onChange(selected.filter(({ id }) => id !== player.id))
    }
  }

  const selectAll = () => { onChange(players) }
  const selectNone = () => { onChange([]) }

  return (
    <>
      {players.map((player, index) => (
        <Form.Check
          key={player.id}
          id={`player-check-${player.id}`}
          label={(
            <>
              #{index + 1} -{' '}
              {player.name}
              {player.deleted && <PlayerDeletedBadge className="ms-1" />}
            </>
          )}
          checked={selected.includes(player)}
          onChange={(event) => setPlayerSelected(player, event.currentTarget.checked)}
          disabled={!canSelect(player)}
        />
      ))}
      <p className="mb-2">
        {selected.length} players selected
      </p>
      <div>
        <Button size="sm" onClick={selectAll}>
          Select all
        </Button>
        <Button size="sm" onClick={selectNone} className="ms-2">
          Select none
        </Button>
      </div>
    </>
  )
}
