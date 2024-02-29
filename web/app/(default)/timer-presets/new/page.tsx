'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TimerPresetForm from '../../../../components/TimerPreset/TimerPresetForm'
import { useErrors } from '../../../../lib/errors'
import { TimerPhaseDurationUnit, TimerPresetCreateInput, TimerPresetListItemFragment, TimerPresetListItemFragmentDoc, useCreateTimerPresetMutation } from '../../../../lib/generated/graphql'

export default function NewTimerPresetPage() {
  const [errors, setErrors] = useErrors()

  const [input, setInput] = useState<TimerPresetCreateInput>({
    name: '',
    phases: [
      {
        name: '',
        durationAmount: 10,
        durationUnit: TimerPhaseDurationUnit.Minutes
      }
    ]
  })

  const router = useRouter()
  const [createTimerPreset, { loading }] = useCreateTimerPresetMutation({
    update(cache, { data }) {
      const preset = data?.timerPresetCreate?.timerPreset

      preset && cache.modify({
        fields: {
          timerPresets(existingTimerPresets = { nodes: [] }) {
            const ref = cache.writeFragment<TimerPresetListItemFragment>({
              fragment: TimerPresetListItemFragmentDoc,
              data: preset
            })

            return {
              ...existingTimerPresets,
              nodes: [...existingTimerPresets.nodes, ref]
            }
          }
        }
      })
    },
    onCompleted({ timerPresetCreate }) {
      setErrors(timerPresetCreate?.errors)

      if (timerPresetCreate?.timerPreset) {
        router.push('/timer-presets')
      }
    }
  })

  return (
    <>
      <h1>Create new timer preset</h1>
      <TimerPresetForm
        className="mb-5"
        input={input}
        errors={errors}
        submit="Create timer preset"
        disabled={loading}
        onUpdate={setInput}
        onSubmit={(input) => createTimerPreset({ variables: { input } })}
      />
    </>
  )
}
