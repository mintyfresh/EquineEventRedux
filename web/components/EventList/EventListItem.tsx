import { gql } from '@apollo/client'
import Link from 'next/link'
import { Dropdown, ListGroup } from 'react-bootstrap'
import { EventListItemFragment, useDeleteEventMutation, useRestoreEventMutation } from '../../lib/generated/graphql'
import EllipsisDropdown from '../EllipsisDropdown'

export const EVENT_LIST_ITEM_FRAGMENT = gql`
  fragment EventListItem on Event {
    id
    name
    slug
    deleted
  }
`

gql`
  mutation DeleteEvent($id: ID!) {
    eventDelete(id: $id) {
      success
    }
  }
`

gql`
  mutation RestoreEvent($id: ID!) {
    eventRestore(id: $id) {
      event {
        id
        ...EventListItem
      }
    }
  }
  ${EVENT_LIST_ITEM_FRAGMENT}
`

export interface EventListItemProps {
  event: EventListItemFragment
  onDelete?: () => void
  onRestore?: () => void
}

const EventListItem: React.FC<EventListItemProps> = ({ event, onDelete, onRestore }) => {
  const [deleteEvent, {}] = useDeleteEventMutation({
    variables: { id: event.id },
    onCompleted: async ({ eventDelete }) => {
      if (eventDelete?.success) {
        onDelete?.()
      }
    }
  })

  const [restoreEvent, {}] = useRestoreEventMutation({
    variables: { id: event.id },
    onCompleted: async ({ eventRestore }) => {
      if (eventRestore?.event) {
        onRestore?.()
      }
    }
  })

  return (
    <ListGroup.Item>
      <Link href={`/events/${event.deleted ? event.id : event.slug}/players`}>
        {event.name}
      </Link>
      <EllipsisDropdown align="end" className="float-end">
        {event.deleted ? (
          <Dropdown.Item onClick={() => restoreEvent()}>Restore</Dropdown.Item>
        ) : (
          <Dropdown.Item className="text-danger" onClick={async () => {
            if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
              deleteEvent()
            }
          }}>
            Delete
          </Dropdown.Item>
        )}
      </EllipsisDropdown>
    </ListGroup.Item>
  )
}

export default EventListItem
