import { gql } from '@apollo/client'
import { ListGroup } from 'react-bootstrap'
import { EventListFragment, EventListItemFragment } from '../lib/generated/graphql'
import EventListItem, { EVENT_LIST_ITEM_FRAGMENT } from './EventList/EventListItem'

export const EVENT_LIST_FRAGMENT = gql`
  fragment EventList on EventConnection {
    nodes {
      id
      ...EventListItem
    }
  }
  ${EVENT_LIST_ITEM_FRAGMENT}
`

export interface EventListProps extends EventListFragment {
  onDelete?: (event: EventListItemFragment) => void
}

const EventList: React.FC<EventListProps> = ({ nodes, onDelete }) => (
  <ListGroup>
    {nodes.map((event) => (
      <EventListItem
        key={event.id}
        event={event}
        onDelete={() => onDelete?.(event)}
      />
    ))}
  </ListGroup>
)

export default EventList
