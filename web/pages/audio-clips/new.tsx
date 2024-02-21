import { gql } from '@apollo/client'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import FormControlErrors from '../../components/Form/FormControlErrors'
import { ERRORS_FRAGMENT, useErrors } from '../../lib/errors'
import { AudioClipCreateInput, useUploadAudioClipMutation } from '../../lib/generated/graphql'
import FormBaseErrors from '../../components/Form/FormBaseErrors'

gql`
  mutation UploadAudioClip($input: AudioClipCreateInput!) {
    audioClipCreate(input: $input) {
      audioClip {
        id
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

const NewAudioClipPage: NextPage = () => {
  const [errors, setErrors] = useErrors()
  const fileInput = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState<AudioClipCreateInput>({ name: '', file: null })

  const router = useRouter()
  const [uploadAudioClip, { loading }] = useUploadAudioClipMutation({
    onCompleted: ({ audioClipCreate }) => {
      setErrors(audioClipCreate?.errors)

      if (audioClipCreate?.audioClip) {
        router.push(`/audio-clips`)
      }
    }
  })

  return (
    <>
      <h1 className="mb-3">
        Upload new audio clip
      </h1>
      <Form onSubmit={(event) => {
        event.preventDefault()

        const file = fileInput.current?.files?.[0] ?? null
        uploadAudioClip({ variables: { input: { ...input, file } } })
      }}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            name="name"
            type="text"
            value={input.name ?? ''}
            onChange={(event) => setInput({ ...input, name: event.currentTarget.value })}
            isInvalid={errors.any('name')}
            disabled={loading}
          />
          <FormControlErrors
            name="name"
            errors={errors}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="file">
          <Form.Label>File*</Form.Label>
          <Form.Control
            name="file"
            type="file"
            ref={fileInput}
            isInvalid={errors.any('file')}
            disabled={loading}
          />
          <Form.Text>
            Supports .acc, .mp3, .ogg, and .wav files up to 5MB.
          </Form.Text>
          <FormControlErrors
            name="file"
            errors={errors}
          />
        </Form.Group>
        <FormBaseErrors errors={errors} />
        <Form.Group>
          <Button type="submit" disabled={loading}>
            Upload
          </Button>
        </Form.Group>
      </Form>
    </>
  )
}

export default NewAudioClipPage
