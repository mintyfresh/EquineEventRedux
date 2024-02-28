import { redirect } from 'next/navigation'
import EventNav from '../../../../components/EventNav'
import { EventLayoutDocument } from '../../../../lib/generated/graphql'
import { getClient } from '../../../../lib/graphql/apollo-client'

export type EventLayoutProps = React.PropsWithChildren<{ params: { id: string } }>

export async function generateMetadata({ params: { id } }: EventLayoutProps) {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: EventLayoutDocument,
      variables: { id }
    })

    if (!data?.event) {
      return null
    }

    return {
      title: `${data.event.name} - Equine Event Runner`
    }
  } catch (error) {
    console.error('Failed to generate metadata for event layout', error)
    return null
  }
}

export default async function EventLayout({ children, params: { id } }: EventLayoutProps) {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: EventLayoutDocument,
      variables: { id }
    })

    if (!data?.event) {
      return null
    }

    return (
      <>
        <header className="d-print-none">
          <h1>{data.event.name}</h1>
          <EventNav event={data.event} />
        </header>
        {children}
      </>
    )
  } catch (error) {
    console.error('Failed to load event layout', error)
    redirect('/events')

    return null
  }
}
