import { gql } from '@apollo/client'
import { NextPage } from 'next'
import { Badge, Button, Card, Col, Dropdown, Row } from 'react-bootstrap'
import { useIndexAudioClipsQuery } from '../../lib/generated/graphql'
import Link from 'next/link'
import EllipsisDropdown from '../../components/EllipsisDropdown'

gql`
  query IndexAudioClips {
    audioClips {
      nodes {
        id
        name
        contentType
        contentTypeHuman
        fileSizeHuman
        fileUrl
        timerPresets {
          id
          name
        }
      }
    }
  }
`

const IndexAudioClipsPage: NextPage = () => {
  const { data } = useIndexAudioClipsQuery()

  return (
    <>
      <h1 className="mb-3">Audio Clips</h1>
      <Link href="/audio-clips/new">
        <Button className="mb-3">
          Upload new audio clip
        </Button>
      </Link>
      <Row>
        {data?.audioClips?.nodes.map((audioClip) => (
          <Col key={audioClip.id} className="mb-3" md={4}>
            <Card>
              <Card.Body>
                <Card.Title className="mb-3">
                  {audioClip.name}
                  <Badge bg="secondary" className="ms-2 align-bottom" style={{ fontSize: '0.75rem' }}>
                    {audioClip.contentTypeHuman}
                  </Badge>
                  <EllipsisDropdown className="float-end" align="end">
                    <Link href={`/audio-clips/${audioClip.id}/edit`} passHref>
                      <Dropdown.Item>Edit</Dropdown.Item>
                    </Link>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      className={audioClip.timerPresets.length > 0 ? 'text-muted' : 'text-danger'}
                      disabled={audioClip.timerPresets.length > 0}
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
        ))}
      </Row>
    </>
  )
}

export default IndexAudioClipsPage
