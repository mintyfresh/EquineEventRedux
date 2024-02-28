import { gql } from '@apollo/client'
import { Nav } from 'react-bootstrap'
import { EventNavFragment } from '../lib/generated/graphql'
import ActiveLink from './ActiveLink'

export const EVENT_NAV_FRAGMENT = gql`
  fragment EventNav on Event {
    id
    slug
    deleted
  }
`

const EventNav: React.FC<{ event: EventNavFragment }> = ({ event }) => {
  const id = event.deleted ? event.id : event.slug

  return (
    <Nav variant="tabs" className="mb-3">
      <Nav.Item>
        <ActiveLink href="/events/[id]/players" as={`/events/${id}/players`} passHref legacyBehavior>
          <Nav.Link accessKey="y">Pla<u>y</u>ers</Nav.Link>
        </ActiveLink>
      </Nav.Item>
      <Nav.Item>
        <ActiveLink href="/events/[id]/matches" as={`/events/${id}/matches`} passHref legacyBehavior>
          <Nav.Link accessKey="m"><u>M</u>atches</Nav.Link>
        </ActiveLink>
      </Nav.Item>
      <Nav.Item>
        <ActiveLink href="/events/[id]/slips" as={`/events/${id}/slips`} passHref legacyBehavior>
          <Nav.Link accessKey="s"><u>S</u>lips</Nav.Link>
        </ActiveLink>
      </Nav.Item>
      <Nav.Item>
        <ActiveLink href="/events/[id]/export" as={`/events/${id}/export`} passHref legacyBehavior>
          <Nav.Link accessKey="x">E<u>x</u>port</Nav.Link>
        </ActiveLink>
      </Nav.Item>
      <Nav.Item>
        <ActiveLink href="/events/[id]/timers" as={`/events/${id}/timers`} passHref legacyBehavior>
          <Nav.Link accessKey="t"><u>T</u>imers</Nav.Link>
        </ActiveLink>
      </Nav.Item>
    </Nav>
  )
}

export default EventNav
