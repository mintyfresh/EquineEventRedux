'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Link from 'next/link'
import { Button } from 'react-bootstrap'
import { AudioClipListItemFragment, IndexAudioClipsDocument, IndexAudioClipsQuery, IndexAudioClipsQueryVariables } from '../../../lib/generated/graphql'
import AudioClipList from './AudioClipList'
import { ApolloClient } from '@apollo/client'

export function onAudioClipCreate<T>(audioClip: AudioClipListItemFragment, client: ApolloClient<T>) {
  client.cache.updateQuery<IndexAudioClipsQuery>(
    {
      query: IndexAudioClipsDocument
    },
    (data) => (data && (
      {
        ...data,
        audioClips: {
          ...data.audioClips,
          nodes: [audioClip, ...data.audioClips.nodes]
        }
      }
    ))
  )
}

export function onAudioClipDelete<T>(audioClip: AudioClipListItemFragment, client: ApolloClient<T>) {
  client.cache.updateQuery<IndexAudioClipsQuery>(
    {
      query: IndexAudioClipsDocument
    },
    (data) => (data && (
      {
        ...data,
        audioClips: {
          ...data.audioClips,
          nodes: data.audioClips.nodes.filter(({ id }) => id !== audioClip.id)
        }
      }
    ))
  )
}

export default function IndexAudioClipsPage() {
  const { client, data: { audioClips } } = useSuspenseQuery<IndexAudioClipsQuery, IndexAudioClipsQueryVariables>(IndexAudioClipsDocument)

  return (
    <>
      <h1 className="mb-3">Audio Clips</h1>
      <Link href="/audio-clips/new" passHref legacyBehavior>
        <Button as="a" className="mb-3">
          Upload new audio clip
        </Button>
      </Link>
      <AudioClipList
        audioClips={audioClips.nodes}
        onDelete={(audioClip) => onAudioClipDelete(audioClip, client)}
      />
    </>
  )
}
