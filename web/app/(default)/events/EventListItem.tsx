import Link from 'next/link'
import { Dropdown, ListGroup } from 'react-bootstrap'
import EllipsisDropdown from '../../../components/EllipsisDropdown'
import { DeletedFilter, EventListItemFragment, EventsIndexDocument, useDeleteEventMutation, useRestoreEventMutation } from '../../../lib/generated/graphql'

export interface EventListItemProps {
  event: EventListItemFragment
  onDelete?(event: EventListItemFragment): void
  onRestore?(event: EventListItemFragment): void
}

export default function EventListItem({ event, onDelete, onRestore }: EventListItemProps) {
  const [deleteEvent, {}] = useDeleteEventMutation({
    variables: { id: event.id },
    refetchQueries: [
      { query: EventsIndexDocument },
      { query: EventsIndexDocument, variables: { deleted: DeletedFilter.Deleted } }
    ],
    onCompleted({ eventDelete }) {
      if (eventDelete?.success) {
        onDelete?.(event)
      }
    }
  })

  const [restoreEvent, {}] = useRestoreEventMutation({
    variables: { id: event.id },
    refetchQueries: [
      { query: EventsIndexDocument },
      { query: EventsIndexDocument, variables: { deleted: DeletedFilter.Deleted } }
    ],
    onCompleted({ eventRestore }) {
      if (eventRestore?.event) {
        onRestore?.(eventRestore.event)
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
