import { Badge } from 'react-bootstrap'

const PlayerUnpaidBadge: React.FC<React.ComponentPropsWithoutRef<typeof Badge>> = (props) => (
  <Badge {...props} bg="warning" pill>unpaid</Badge>
)

export default PlayerUnpaidBadge
