import { gql } from '@apollo/client'
import Head from 'next/head'
import { EventLayoutFragment } from '../lib/generated/graphql'
import EventNav, { EVENT_NAV_FRAGMENT } from './EventNav'
import Layout from './Layout'

export const EVENT_LAYOUT_FRAGMENT = gql`
  fragment EventLayout on Event {
    name
    ...EventNav
  }
  ${EVENT_NAV_FRAGMENT}
`

export type EventLayoutProps = React.PropsWithChildren<{ event: EventLayoutFragment }>

const EventLayout: React.FC<EventLayoutProps> = ({ event, children }) => {
  return (
    <Layout>
      <Head>
        <title>{event.name} - Equine Event Runner</title>
      </Head>
      <h1>{event.name}</h1>
      <EventNav event={event} />
      {children}
    </Layout>
  )
}

export default EventLayout
