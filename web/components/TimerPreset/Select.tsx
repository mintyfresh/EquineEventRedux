import { gql } from '@apollo/client'
import { TimerPresetSelectFragment } from '../../lib/generated/graphql'
import React from 'react'
import { Form } from 'react-bootstrap'

export const TIMER_PRESET_SELECT_FRAGMENT = gql`
  fragment TimerPresetSelect on TimerPreset {
    id
    name
    phasesCount
    totalDurationInSeconds
  }

`

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
      <option value=""></option>
      {timerPresets.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.name}
        </option>
      ))}
    </Form.Select>
  )
}

export default TimerPresetSelect
