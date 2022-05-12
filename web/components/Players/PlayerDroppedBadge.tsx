import { Badge } from 'react-bootstrap'

const PlayerDroppedBadge: React.FC<React.ComponentPropsWithoutRef<typeof Badge>> = (props) => (
  <Badge {...props} bg="danger" pill>dropped</Badge>
)

export default PlayerDroppedBadge
