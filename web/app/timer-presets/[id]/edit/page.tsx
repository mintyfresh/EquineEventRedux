'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TimerPresetForm from '../../../../components/TimerPreset/TimerPresetForm'
import { ERRORS_FRAGMENT, useErrors } from '../../../../lib/errors'
import { EditTimerPresetQuery, EditTimerPresetQueryVariables, TimerPresetUpdateInput, useUpdateTimerPresetMutation } from '../../../../lib/generated/graphql'

const EDIT_TIMER_PRESET_QUERY = gql`
  query EditTimerPreset($id: ID!) {
    timerPreset(id: $id) {
      id
      name
      isSystem
      phases {
        id
        name
        position
        durationAmount
        durationUnit
      }
    }
  }
`

gql`
  mutation UpdateTimerPreset($id: ID!, $input: TimerPresetUpdateInput!) {
    timerPresetUpdate(id: $id, input: $input) {
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

export default function EditTimerPresetPage({ params: { id } }: { params: { id: string } }) {
  const [errors, setErrors] = useErrors()
  const [input, setInput] = useState<TimerPresetUpdateInput | null>(null)

  const { data } = useQuery<EditTimerPresetQuery, EditTimerPresetQueryVariables>(EDIT_TIMER_PRESET_QUERY, {
    variables: { id },
    onCompleted: (data) => {
      setInput({
        name: data.timerPreset.name,
        phases: data.timerPreset.phases.map((phase) => ({
          id: phase.id,
          name: phase.name,
          position: phase.position,
          durationAmount: phase.durationAmount,
          durationUnit: phase.durationUnit
        }))
      })
    }
  })

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
