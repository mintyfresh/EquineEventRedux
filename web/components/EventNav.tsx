import { gql } from '@apollo/client'
import { Nav } from 'react-bootstrap'
import { EventNavFragment } from '../lib/generated/graphql'
import ActiveLink from './ActiveLink'

export const EVENT_NAV_FRAGMENT = gql`
  fragment EventNav on Event {
    id
  }
`

const EventNav: React.FC<{ event: EventNavFragment }> = ({ event }) => (
  <Nav variant="tabs" className="mb-3">
    <Nav.Item>
      <ActiveLink href="/events/[id]" as={`/events/${event.id}`} passHref>
        <Nav.Link>Status</Nav.Link>
      </ActiveLink>
    </Nav.Item>
    <Nav.Item>
      <ActiveLink href="/events/[id]/players" as={`/events/${event.id}/players`} passHref>
        <Nav.Link accessKey="y">Pla<u>y</u>ers</Nav.Link>
      </ActiveLink>
    </Nav.Item>
    <Nav.Item>
      <ActiveLink href="/events/[id]/matches" as={`/events/${event.id}/matches`} passHref>
        <Nav.Link accessKey="m"><u>M</u>atches</Nav.Link>
      </ActiveLink>
    </Nav.Item>
    <Nav.Item>
      <ActiveLink href="/events/[id]/slips" as={`/events/${event.id}/slips`} passHref>
        <Nav.Link accessKey="s"><u>S</u>lips</Nav.Link>
      </ActiveLink>
    </Nav.Item>
  </Nav>
)

export default EventNav
