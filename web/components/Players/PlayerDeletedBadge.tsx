import { Badge } from 'react-bootstrap'

const PlayerDeletedBadge: React.FC<React.ComponentPropsWithoutRef<typeof Badge>> = (props) => (
  <Badge {...props} bg="dark" pill>deleted</Badge>
)

export default PlayerDeletedBadge
