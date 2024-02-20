import { gql } from '@apollo/client'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useAudioClipSelectQuery } from '../../lib/generated/graphql'

gql`
  query AudioClipSelect {
    audioClips {
      nodes {
        id
        name
        fileName
        fileUrl
      }
    }
  }
`

export interface AudioClipSelectProps extends Omit<React.ComponentProps<typeof Form.Select>, 'onChange'> {
  onChange?(id: string | null | undefined): void
  inputGroupProps?: React.ComponentProps<typeof InputGroup>
}

const AudioClipSelect: React.FC<AudioClipSelectProps> = ({ inputGroupProps, onChange, ...props }) => {
  const { data, loading } = useAudioClipSelectQuery()

  const playAudioClip = (id: string | null | undefined) => {
    if (!id) {
      return
    }

    const audioClip = data?.audioClips?.nodes?.find((audioClip) => audioClip.id === id)

    if (!audioClip) {
      return
    }

    const audio = new Audio(audioClip.fileUrl)
    audio.play()
  }

  return (
    <InputGroup {...inputGroupProps}>
      <Form.Select
        {...props}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        disabled={loading || props.disabled}
      >
        <option value="">None</option>
        {data?.audioClips?.nodes?.map((audioClip) => (
          <option key={audioClip.id} value={audioClip.id}>
            {audioClip.name} {audioClip.name !== audioClip.fileName && `(${audioClip.fileName})`}
          </option>
        ))}
      </Form.Select>
      <Button
        variant="outline-secondary"
        title="Preview audio cue"
        onClick={() => playAudioClip(props.selected)}
        disabled={loading || !props.selected}
      >
        <FontAwesomeIcon icon={faPlay} title="Preview audio cue" />
      </Button>
    </InputGroup>
  )
}

export default AudioClipSelect
