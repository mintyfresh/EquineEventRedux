import { gql } from '@apollo/client'
import { useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { TimerCreateInput, useCreateTimerInlineMutation, useTimerInlineCreateFormPresetsQuery } from '../../lib/generated/graphql'
import TimerPresetSelect, { TIMER_PRESET_SELECT_FRAGMENT } from '../TimerPreset/TimerPresetSelect'

gql`
  query TimerInlineCreateFormPresets {
    timerPresets {
      nodes {
        ...TimerPresetSelect
      }
    }
  }
  ${TIMER_PRESET_SELECT_FRAGMENT}
`

gql`
  mutation CreateTimerInline($eventId: ID!, $input: TimerCreateInput!) {
    timerCreate(eventId: $eventId, input: $input) {
      timer {
        id
      }
    }
  }
`

export interface TimerInlineCreateFormProps {
  eventId: string
  onCreate?: (timerId: string) => void
}

const TimerInlineCreateForm: React.FC<TimerInlineCreateFormProps> = ({ eventId, onCreate }) => {
  const [input, setInput] = useState<TimerCreateInput | null>(null)
  const { data } = useTimerInlineCreateFormPresetsQuery({
    onCompleted: ({ timerPresets }) => {
      setInput((input) => input ?? { presetId: timerPresets.nodes[0]?.id ?? '' })
    }
  })

  const [createTimer, {}] = useCreateTimerInlineMutation({
    onCompleted: ({ timerCreate }) => {
      if (timerCreate?.timer) {
        onCreate?.(timerCreate.timer.id)
      }
    }
  })

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        createTimer({ variables: { eventId, input: input! } })
      }}
    >
      <Row>
        <Col xs="auto">
          <InputGroup>
            <InputGroup.Text>Preset</InputGroup.Text>
            <TimerPresetSelect
              timerPresets={data?.timerPresets.nodes ?? []}
              selected={input?.presetId ?? ''}
              onChange={(preset) => setInput({ ...input, presetId: preset.id })}
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Button variant="secondary" type="submit">
            Start
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default TimerInlineCreateForm
