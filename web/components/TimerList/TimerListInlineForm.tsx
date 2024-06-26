import { useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { TimerCreateInput, TimerListItemFragment, useCreateTimerInlineMutation, useTimerListInlineFormPresetsQuery } from '../../lib/generated/graphql'
import TimerPresetSelect from '../TimerPreset/TimerPresetSelect'

export interface TimerListInlineFormProps {
  roundId: string
  onCreate?: (timer: TimerListItemFragment) => void
}

const TimerListInlineForm: React.FC<TimerListInlineFormProps> = ({ roundId, onCreate }) => {
  const [input, setInput] = useState<TimerCreateInput | null>(null)
  const { data } = useTimerListInlineFormPresetsQuery({
    onCompleted: ({ timerPresets }) => {
      setInput((input) => input ?? { presetId: timerPresets.nodes[0]?.id ?? '', roundId })
    }
  })

  const [createTimer, {}] = useCreateTimerInlineMutation({
    onCompleted: ({ timerCreate }) => {
      if (timerCreate?.timer) {
        onCreate?.(timerCreate.timer)
      }
    }
  })

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        createTimer({ variables: { input: input! } })
      }}
    >
      <Row>
        <Col xs="auto">
          <InputGroup>
            <InputGroup.Text>Preset</InputGroup.Text>
            <TimerPresetSelect
              timerPresets={data?.timerPresets.nodes ?? []}
              selected={input?.presetId ?? ''}
              onChange={(preset) => setInput({ ...input, presetId: preset.id, roundId })}
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

export default TimerListInlineForm
