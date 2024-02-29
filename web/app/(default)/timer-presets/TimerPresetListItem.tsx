'use client'

import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { TimerPresetListItemFragment, useDeleteTimerPresetMutation } from '../../../lib/generated/graphql'

export interface TimerPresetListItemProps {
  preset: TimerPresetListItemFragment,
  onDelete?(preset: TimerPresetListItemFragment): void
}

export default function TimerPresetListItem({ preset, onDelete }: TimerPresetListItemProps) {
  const [deleteTimerPreset] = useDeleteTimerPresetMutation({
    variables: { id: preset.id },
    onCompleted({ timerPresetDelete }) {
      if (timerPresetDelete?.success) {
        onDelete?.(preset)
      }
    }
  })

  return (
    <Card key={preset.id} body className="mb-3">
      <Row>
        <Col>
          <Card.Title><h4>{preset.name}</h4></Card.Title>
        </Col>
        <Col xs="auto">
          <Link href={`/timer-presets/${preset.id}/edit`} passHref legacyBehavior>
            <Button as="a" variant="outline-secondary">Edit</Button>
          </Link>
          {!preset.isSystem && (
            <Button variant="outline-danger" className="ms-2" onClick={() => (
              confirm(`Are you sure you want to delete the timer preset "${preset.name}"?`) &&
                deleteTimerPreset()
            )}>
              Delete
            </Button>
          )}
        </Col>
      </Row>
      <Card.Text>
        {preset.phasesCount} phases, {preset.totalDurationHumanized} total
        {preset.isSystem && <span className="text-muted"> (system-defined)</span>}
      </Card.Text>
      <Card.Subtitle className="mb-2">Phases</Card.Subtitle>
      <Row>
        {preset.phases.map((phase) => (
          <Col key={phase.id} md={4} lg={3} className="mb-0">
            <Card body>
              <Card.Title>
                {phase.name}
                {phase.audioClip && (
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    className="ms-2 small text-muted"
                    title="Includes an audio-cue"
                  />
                )}
              </Card.Title>
              <Card.Text>
                {phase.durationHumanized}
              </Card.Text>
            </Card>
          </Col>
        ))}
        {preset.phasesCount > 3 && (
          <Col md={12} lg={3}>
            <Card body className="h-100">
              <Card.Text>
                <b>And {preset.phasesCount - 3} more...</b>
              </Card.Text>
            </Card>
          </Col>
        )}
      </Row>
    </Card>
  )
}