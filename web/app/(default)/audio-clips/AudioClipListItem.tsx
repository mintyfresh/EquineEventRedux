import { Col, Card, Badge, Dropdown } from 'react-bootstrap'
import EllipsisDropdown from '../../../components/EllipsisDropdown'
import { AudioClipListItemFragment, useDeleteAudioClipMutation } from '../../../lib/generated/graphql'

export interface AudioClipListItemProps {
  audioClip: AudioClipListItemFragment
  onDelete?(audioClip: AudioClipListItemFragment): void
}

export default function AudioClipListItem({ audioClip, onDelete }: AudioClipListItemProps) {
  const [deleteAudioClip] = useDeleteAudioClipMutation({
    variables: { id: audioClip.id },
    update(cache, { data }) {
      data?.audioClipDelete?.success && cache.modify({
        fields: {
          audioClips(audioClips = { nodes: [] }, { readField }) {
            return {
              ...audioClips,
              nodes: audioClips.nodes.filter((ref: any) => (
                readField('id', ref) !== audioClip.id
              ))
            }
          }
        }
      })
    },
    onCompleted({ audioClipDelete }) {
      if (audioClipDelete?.success) {
        onDelete?.(audioClip)
      }
    }
  })

  return (
    <Col className="mb-3" md={4}>
      <Card>
        <Card.Body>
          <Card.Title className="mb-3">
            {audioClip.name}
            <Badge bg="secondary" className="ms-2 align-bottom" style={{ fontSize: '0.75rem' }}>
              {audioClip.contentTypeHuman}
            </Badge>
            <EllipsisDropdown className="float-end" align="end">
              <Dropdown.Item
                className={audioClip.timerPresets.length > 0 ? 'text-muted' : 'text-danger'}
                disabled={audioClip.timerPresets.length > 0}
                onClick={() => (
                  confirm('Are you sure you want to delete this audio clip?') &&
                    deleteAudioClip()
                )}
              >
                Delete
              </Dropdown.Item>
            </EllipsisDropdown>
          </Card.Title>
          <audio controls className="mb-2 w-100">
            <source src={audioClip.fileUrl} type={audioClip.contentType} />
          </audio>
          <Card.Text className="text-muted text-end text-nowrap overflow-x-hidden">
            {audioClip.fileSizeHuman} - used in {audioClip.timerPresets.length} presets
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  )
}