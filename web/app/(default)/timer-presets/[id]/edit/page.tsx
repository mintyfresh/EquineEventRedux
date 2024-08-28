'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TimerPresetForm from '../../../../../components/TimerPreset/TimerPresetForm'
import { useErrors } from '../../../../../lib/errors'
import { EditTimerPresetDocument, EditTimerPresetQuery, EditTimerPresetQueryVariables, TimerPresetUpdateInput, useUpdateTimerPresetMutation } from '../../../../../lib/generated/graphql'

export default function EditTimerPresetPage({ params: { id } }: { params: { id: string } }) {
  const [errors, setErrors] = useErrors()
  const [input, setInput] = useState<TimerPresetUpdateInput | null>(null)

  const { data } = useSuspenseQuery<EditTimerPresetQuery, EditTimerPresetQueryVariables>(EditTimerPresetDocument, {
    variables: { id }
  })

  useEffect(() => {
    setInput({
      name: data.timerPreset.name,
      phases: data.timerPreset.phases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        colour: phase.colour,
        position: phase.position,
        durationAmount: phase.durationAmount,
        durationUnit: phase.durationUnit
      }))
    })
  }, [data?.timerPreset])

  const router = useRouter()
  const [updateTimerPreset, { loading }] = useUpdateTimerPresetMutation({
    onCompleted: (data) => {
      setErrors(data?.timerPresetUpdate?.errors)

      if (data.timerPresetUpdate?.timerPreset) {
        router.push('/timer-presets')
      }
    }
  })

  if (!input) {
    return null;
  }

  return (
    <>
      <h1 className="mb-3">
        Edit {data?.timerPreset.isSystem && 'system'} preset {data?.timerPreset?.name}
      </h1>
      <TimerPresetForm
        className="mb-5"
        input={input}
        errors={errors}
        submit="Save changes"
        disabled={loading}
        onUpdate={setInput}
        onSubmit={(input) => updateTimerPreset({ variables: { id, input } })}
      />
    </>
  )
}
