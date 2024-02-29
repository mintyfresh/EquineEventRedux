import { ListGroup } from 'react-bootstrap'
import { EventListFragment, EventListItemFragment } from '../../../lib/generated/graphql'
import EventListItem from './EventListItem'

export interface EventListProps {
  events: EventListItemFragment[]
  onDelete?(event: EventListItemFragment): void
  onRestore?(event: EventListItemFragment): void
}

export default function EventList({ events, onDelete, onRestore }: EventListProps) {
    return (
    <ListGroup>
      {events.map((event) => (
        <EventListItem
          key={event.id}
          event={event}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </ListGroup>
  )
}
