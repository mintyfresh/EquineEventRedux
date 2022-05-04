import { gql } from '@apollo/client'
import Link from 'next/link'
import { Dropdown, ListGroup } from 'react-bootstrap'
import { EventListItemFragment } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'

export const EVENT_LIST_ITEM_FRAGMENT = gql`
  fragment EventListItem on Event {
    id
    name
  }
`

const EventListItem: React.FC<{ event: EventListItemFragment }> = ({ event }) => (
  <ListGroup.Item>
    <Link href="/events/[id]" as={`/events/${event.id}`}>
      {event.name}
    </Link>
    <EllipsisDropdown align="end" className="float-end">
      <Dropdown.Item className="text-danger" onClick={async () => {
        if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
          // TODO: Implement deletion.
        }
      }}>
        Delete
      </Dropdown.Item>
    </EllipsisDropdown>
  </ListGroup.Item>
)

export default EventListItem
