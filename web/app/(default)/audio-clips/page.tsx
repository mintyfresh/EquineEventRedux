'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Link from 'next/link'
import { Button } from 'react-bootstrap'
import { IndexAudioClipsDocument, IndexAudioClipsQuery, IndexAudioClipsQueryVariables } from '../../../lib/generated/graphql'
import AudioClipList from './AudioClipList'

export default function IndexAudioClipsPage() {
  const { data: { audioClips } } = useSuspenseQuery<IndexAudioClipsQuery, IndexAudioClipsQueryVariables>(IndexAudioClipsDocument)

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
      />
    </>
  )
}
