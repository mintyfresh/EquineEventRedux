import { Row } from 'react-bootstrap'
import { AudioClipListItemFragment } from '../../../lib/generated/graphql'
import AudioClipListItem from './AudioClipListItem'

export interface AudioClipListProps extends React.ComponentProps<typeof Row> {
  audioClips: AudioClipListItemFragment[]
  onDelete?(audioClip: AudioClipListItemFragment): void
}

export default function AudioClipList({ audioClips, onDelete, ...props }: AudioClipListProps) {
  return (
    <Row {...props}>
      {audioClips.map((audioClip) => (
        <AudioClipListItem
          key={audioClip.id}
          audioClip={audioClip}
          onDelete={onDelete}
        />
      ))}
    </Row>
  )
}