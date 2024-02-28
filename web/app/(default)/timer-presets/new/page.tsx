'use client'

import { gql } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TimerPresetForm from '../../../../components/TimerPreset/TimerPresetForm'
import { ERRORS_FRAGMENT, useErrors } from '../../../../lib/errors'
import { TimerPhaseDurationUnit, TimerPresetCreateInput, useCreateTimerPresetMutation } from '../../../../lib/generated/graphql'

gql`
  mutation CreateTimerPreset($input: TimerPresetCreateInput!) {
    timerPresetCreate(input: $input) {
      timerPreset {
        id
      }
      errors {
        ...Errors
      }
    }
  }
  ${ERRORS_FRAGMENT}
`

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
    onCompleted: (data) => {
      setErrors(data?.timerPresetCreate?.errors)

      if (data.timerPresetCreate?.timerPreset) {
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
