import React from 'react'
import { Form } from 'react-bootstrap'
import { TimerPresetSelectFragment } from '../../lib/generated/graphql'

export interface TimerPresetSelectProps extends Omit<React.ComponentProps<typeof Form.Select>, 'value' | 'onChange'> {
  timerPresets: TimerPresetSelectFragment[]
  selected?: TimerPresetSelectFragment | string
  onChange?: (value: TimerPresetSelectFragment) => (Promise<void> | void)
}

const TimerPresetSelect: React.FC<TimerPresetSelectProps> = ({ timerPresets, selected, onChange, ...props }) => {
  return (
    <Form.Select
      {...props}
      value={selected instanceof Object ? selected.id : selected}
      onChange={(event) => {
        const value = timerPresets.find((preset) => preset.id === event.currentTarget.value)
        value && onChange?.(value)
      }}
    >
      {timerPresets.map((preset, index) => (
        <option key={preset.id ?? index} value={preset.id}>
          {preset.name}
        </option>
      ))}
    </Form.Select>
  )
}

export default TimerPresetSelect
