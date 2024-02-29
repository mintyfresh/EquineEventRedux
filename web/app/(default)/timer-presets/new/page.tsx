'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TimerPresetForm from '../../../../components/TimerPreset/TimerPresetForm'
import { useErrors } from '../../../../lib/errors'
import { TimerPhaseDurationUnit, TimerPresetCreateInput, useCreateTimerPresetMutation } from '../../../../lib/generated/graphql'
import { onTimerPresetCreate } from '../page'

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
  const [createTimerPreset, { client, loading }] = useCreateTimerPresetMutation({
    onCompleted: (data) => {
      setErrors(data?.timerPresetCreate?.errors)

      const preset = data?.timerPresetCreate?.timerPreset

      if (preset) {
        onTimerPresetCreate(preset, client)
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
