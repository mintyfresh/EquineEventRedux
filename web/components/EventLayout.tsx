import Head from 'next/head'
import { EventLayoutFragment } from '../lib/generated/graphql'
import EventNav from './EventNav'
import Layout from './Layout'

export type EventLayoutProps = React.PropsWithChildren<{ event: EventLayoutFragment }>

const EventLayout: React.FC<EventLayoutProps> = ({ event, children }) => {
  return (
    <Layout>
      <Head>
        <title>{event.name} - Equine Event Runner</title>
      </Head>
      <header className="d-print-none">
        <h1>{event.name}</h1>
        <EventNav event={event} />
      </header>
      {children}
    </Layout>
  )
}

export default EventLayout
