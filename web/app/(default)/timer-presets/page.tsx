'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Link from 'next/link'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { TimerPresetsDocument, TimerPresetsQuery } from '../../../lib/generated/graphql'
import TimerPresetList from './TimerPresetList'

export default function TimerPresetsPage() {
  const { data: { timerPresets } } = useSuspenseQuery<TimerPresetsQuery>(TimerPresetsDocument)

  return (
    <>
      <h1 className="mb-3">Timer Presets</h1>
      <Row className="mb-3">
        <Col>
          <Link href="/timer-presets/new" passHref legacyBehavior>
            <Button as="a" variant="primary">Create new preset</Button>
          </Link>
        </Col>
      </Row>
      {timerPresets.nodes.every((preset) => preset.isSystem) && (
        <Alert variant="info">
          <p>
            Timer presets define reusable configurations for timers.
            Each preset consists of a series of one or more phases, with each phase having a name and a duration.
            Optionally, a phase can include an audio-cue to play to signal its end.
          </p>
          <p className="mb-0">
            We&apos;ve provided a couple of system-defined presets to get you started.
            You can rename and modify them as needed, or create your own from scratch.
          </p>
        </Alert>
      )}
      <TimerPresetList
        timerPresets={timerPresets.nodes}
      />
    </>
  )
}
