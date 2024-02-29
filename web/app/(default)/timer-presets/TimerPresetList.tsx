'use client'

import { TimerPresetListFragment, TimerPresetListItemFragment } from '../../../lib/generated/graphql'
import TimerPresetListItem from './TimerPresetListItem'

export interface TimerPresetListProps {
  presetList: TimerPresetListFragment
  onDelete?(preset: TimerPresetListItemFragment): void
}

export default function TimerPresetList({ presetList, onDelete }: TimerPresetListProps) {
  return (
    <>
      {presetList.nodes?.map((preset) => (
        <TimerPresetListItem
          key={preset.id}
          preset={preset}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}
