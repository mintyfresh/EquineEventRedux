'use client'

import { TimerPresetListItemFragment } from '../../../lib/generated/graphql'
import TimerPresetListItem from './TimerPresetListItem'

export interface TimerPresetListProps {
  timerPresets: TimerPresetListItemFragment[]
  onDelete?(preset: TimerPresetListItemFragment): void
}

export default function TimerPresetList({ timerPresets, onDelete }: TimerPresetListProps) {
  return (
    <>
      {timerPresets.map((preset) => (
        <TimerPresetListItem
          key={preset.id}
          preset={preset}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}
