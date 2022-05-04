import { gql } from '@apollo/client'
import { ListGroup } from 'react-bootstrap'
import { EventListFragment } from '../lib/generated/graphql'
import EventListItem, { EVENT_LIST_ITEM_FRAGMENT } from './EventList/EventListItem'

export const EVENT_LIST_FRAGMENT = gql`
  fragment EventList on EventConnection {
    nodes {
      id
      ...EventListItem
    }
  }
  ${EVENT_LIST_ITEM_FRAGMENT}
`;

const EventList: React.FC<EventListFragment> = ({ nodes }) => (
  <ListGroup>
    {nodes.map((event) => (
      <EventListItem key={event.id} event={event} />
    ))}
  </ListGroup>
)

export default EventList
