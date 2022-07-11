import { gql } from '@apollo/client'
import Link from 'next/link'
import { Dropdown, ListGroup } from 'react-bootstrap'
import { EventListItemFragment, useDeleteEventMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'

export const EVENT_LIST_ITEM_FRAGMENT = gql`
  fragment EventListItem on Event {
    id
    name
  }
`

gql`
  mutation DeleteEvent($id: ID!) {
    eventDelete(id: $id) {
      success
    }
  }
`

export interface EventListItemProps {
  event: EventListItemFragment
  onDelete?: () => void
}

const EventListItem: React.FC<EventListItemProps> = ({ event, onDelete }) => {
  const [deleteEvent, {}] = useDeleteEventMutation({
    variables: { id: event.id },
    onCompleted: async ({ eventDelete }) => {
      if (eventDelete?.success) {
        onDelete?.()
      }
    }
  })

  return (
    <ListGroup.Item>
      <Link href="/events/[id]" as={`/events/${event.id}`}>
        {event.name}
      </Link>
      <EllipsisDropdown align="end" className="float-end">
        <Dropdown.Item className="text-danger" onClick={async () => {
          if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
            deleteEvent()
          }
        }}>
          Delete
        </Dropdown.Item>
      </EllipsisDropdown>
    </ListGroup.Item>
  )
}

export default EventListItem
