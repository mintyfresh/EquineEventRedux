import { gql } from '@apollo/client'
import Head from 'next/head'
import { EventLayoutFragment } from '../lib/generated/graphql'
import Layout from './Layout'

export const EVENT_LAYOUT_FRAGMENT = gql`
  fragment EventLayout on Event {
    name
  }
`

export type EventLayoutProps = React.PropsWithChildren<{ event: EventLayoutFragment }>

const EventLayout: React.FC<EventLayoutProps> = ({ event, children }) => {
  return (
    <Layout>
      <Head>
        <title>{event.name} - Equine Event Runner</title>
      </Head>
      <h1>{event.name}</h1>
      {children}
    </Layout>
  )
}

export default EventLayout
