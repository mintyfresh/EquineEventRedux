import { Button, Form } from 'react-bootstrap'
import { TimerCreateInput, TimerPresetSelectFragment } from '../../lib/generated/graphql'
import TimerPresetSelect from '../TimerPreset/Select'

export interface TimerInlineCreateFormProps {
  presets: TimerPresetSelectFragment[]
  input: TimerCreateInput
  onUpdate?: (input: TimerCreateInput) => void
  onSubmit?: () => void
}

const TimerInlineCreateForm: React.FC<TimerInlineCreateFormProps> = ({ presets, input, onUpdate, onSubmit }) => {
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.()
      }}
    >
      <TimerPresetSelect
        timerPresets={presets}
        selected={input.presetId}
        onChange={(preset) => onUpdate?.({ ...input, presetId: preset.id })}
      />
      <Button type="submit">Create</Button>
    </Form>
  )
}

export default TimerInlineCreateForm
