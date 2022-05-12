import { gql } from '@apollo/client'
import { PlayerNameWithBadgesFragment } from '../../lib/generated/graphql'
import PlayerDeletedBadge from './PlayerDeletedBadge'
import PlayerDroppedBadge from './PlayerDroppedBadge'
import PlayerUnpaidBadge from './PlayerUnpaidBadge'

export const PLAYER_NAME_WITH_BADGES_FRAGMENT = gql`
  fragment PlayerNameWithBadges on Player {
    id
    name
    paid
    dropped
    deleted
  }
`

export interface PlayerNameWithBadgesProps extends React.ComponentPropsWithoutRef<'span'> {
  player: PlayerNameWithBadgesFragment
}

const PlayerNameWithBadges: React.FC<PlayerNameWithBadgesProps> = ({ player, ...props }) => (
  <span {...props}>
    {player.name}
    {player.paid || <PlayerUnpaidBadge className="ms-1" />}
    {player.dropped && <PlayerDroppedBadge className="ms-1" />}
    {player.deleted && <PlayerDeletedBadge className="ms-1" />}
  </span>
)

export default PlayerNameWithBadges
