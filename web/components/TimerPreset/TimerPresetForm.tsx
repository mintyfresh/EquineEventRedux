import { faFlag, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { Errors } from '../../lib/errors'
import { TimerPhaseDurationUnit, TimerPresetCreateInput, TimerPresetPhaseInput, TimerPresetUpdateInput } from '../../lib/generated/graphql'
import AudioClipSelect from '../AudioClip/AudioClipSelect'
import FormControlErrors from '../Form/FormControlErrors'
import FormMultiControlErrors from '../Form/FormMultiControlErrors'

const DURATION_UNIT_KEYS = Object.keys(TimerPhaseDurationUnit)
const DURATION_UNIT_VALUES = Object.values(TimerPhaseDurationUnit)

interface TimerPresetFormPhaseProps extends React.ComponentProps<typeof Card> {
  index: number
  phase: TimerPresetPhaseInput
  errors: Errors
  disabled: boolean
  onUpdate(input: TimerPresetPhaseInput): void
  onDelete(): void
}

const TimerPresetFormPhase: React.FC<TimerPresetFormPhaseProps> = ({ index, phase, errors, disabled, onUpdate, onDelete, ...props }) => {
  return (
    <Card {...props}>
      <Card.Header>
        <Row>
          <Col className="my-auto">
            <span className={phase._destroy ? 'text-decoration-line-through' : undefined}>
              Phase {index + 1}
            </span>
            {phase._destroy && (
              <span className="text-muted ms-2">(Marked for deletion)</span>
            )}
          </Col>
          <Col xs="auto">
            <Button
              type="button"
              onClick={() => onDelete()}
              variant="link"
              size="sm"
              className={phase._destroy ? 'text-danger' : 'text-black'}
              title={`${phase._destroy ? 'Restore' : 'Delete'} phase ${index + 1}`}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={phase._destroy ? faFlag : faTrash} />
            </Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Label*</Form.Label>
              <Form.Control
                type="text"
                title={`Phase ${index + 1} label`}
                value={phase.name ?? ''}
                onChange={(event) => onUpdate({ name: event.currentTarget.value })}
                isInvalid={errors.any(`name`)}
                disabled={phase._destroy || disabled}
                required
              />
              <Form.Text>
                Displayed above the timer when the phase is active.
              </Form.Text>
              <FormControlErrors
                name={`name`}
                errors={errors}
              />
            </Form.Group>
          </Col>
          <Col md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Duration*</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  title={`Phase ${index + 1} duration amount`}
                  value={phase.durationAmount ?? ''}
                  onChange={(event) => onUpdate({ durationAmount: +event.currentTarget.value })}
                  isInvalid={errors.any(`durationAmount`)}
                  disabled={phase._destroy || disabled}
                  required
                />
                <Form.Select
                  title={`Phase ${index + 1} duration unit`}
                  value={phase.durationUnit ?? TimerPhaseDurationUnit.Minutes}
                  onChange={(event) => onUpdate({ durationUnit: event.currentTarget.value as TimerPhaseDurationUnit })}
                  isInvalid={errors.any(`durationUnit`)}
                  disabled={phase._destroy || disabled}
                  required
                >
                  {DURATION_UNIT_KEYS.map((key, index) => (
                    <option key={key} value={DURATION_UNIT_VALUES[index]}>{key}</option>
                  ))}
                </Form.Select>
              </InputGroup>
              <FormMultiControlErrors
                names={[`durationAmount`, `durationUnit`]}
                errors={errors}
              />
            </Form.Group>
          </Col>
          <Col lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Audio Cue</Form.Label>
              <AudioClipSelect
                title={`Phase ${index + 1} audio clip`}
                selected={phase.audioClipId}
                onChange={(audioClipId) => onUpdate({ audioClipId })}
                isInvalid={errors.any(`audioClip`)}
                disabled={phase._destroy || disabled}
              />
              <Form.Text>
                Played when the phase ends.
                {index === 0 && (
                  <span>{' '}
                    You can manage and upload files in the <a href="/audio-clips" target="_blank">Audio Clips</a> section.
                    (Link will open in a new tab.)
                  </span>
                )}
              </Form.Text>
              <FormControlErrors
                name={`audioClip`}
                errors={errors}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

const calculatePhasePositions = (phases: TimerPresetPhaseInput[]) => {
  let position = 1

  return phases.map((phase) => (
    { ...phase, position: phase._destroy ? undefined : position++ }
  ))
}

type TimerPresetInput = TimerPresetCreateInput | TimerPresetUpdateInput

export interface TimerPresetFormProps<Input extends TimerPresetInput> extends Omit<React.ComponentProps<typeof Form>, 'onSubmit'> {
  input: Input
  errors: Errors
  submit: string
  disabled?: boolean
  onUpdate(input: Input): void
  onSubmit(input: Input): void
}

function TimerPresetForm<Input extends TimerPresetInput>({ input, errors, submit, disabled, onUpdate, onSubmit, ...props }: TimerPresetFormProps<Input>) {
  const addInputPhase = () => {
    const newPhases = [
      ...input.phases ?? [],
      {
        name: '',
        durationAmount: 10,
        durationUnit: TimerPhaseDurationUnit.Minutes
      }
    ]

    onUpdate({ ...input, phases: calculatePhasePositions(newPhases) })
  }

  const updateInputPhase = (index: number, phase: Partial<TimerPresetPhaseInput>) => {
    const newPhases = [...input.phases ?? []]
    newPhases[index] = { ...newPhases[index], ...phase }

    onUpdate({ ...input, phases: calculatePhasePositions(newPhases) })
  }

  const deleteInputPhase = (index: number) => {
    const phase = input.phases?.[index]

    if (phase?.id) {
      // Mark persisted records for deletion by server
      // (Toggle _destroy flag on repeated clicks)
      updateInputPhase(index, { _destroy: !phase._destroy })
      return
    }

    const newPhases = [...input.phases ?? []]
    newPhases.splice(index, 1)

    onUpdate({ ...input, phases: calculatePhasePositions(newPhases) })
  }

  return (
    <Form
      {...props}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(input)
      }}
    >
      <Form.Group className="mb-3">
        <Form.Label>Name*</Form.Label>
        <Form.Control
          type="text"
          title="Name"
          value={input.name ?? ''}
          onChange={(event) => onUpdate({ ...input, name: event.currentTarget.value })}
          isInvalid={errors.any('name')}
          disabled={disabled}
          required
        />
        <FormControlErrors
          name="name"
          errors={errors}
        />
      </Form.Group>
      <h2>Phases</h2>
      {input.phases?.map((phase, index) => (
        <TimerPresetFormPhase
          key={index}
          className="mb-3"
          index={index}
          phase={phase}
          errors={errors.prefix(`phases[${index}]`)}
          disabled={disabled ?? false}
          onUpdate={(phase) => updateInputPhase(index, phase)}
          onDelete={() => deleteInputPhase(index)}
        />
      ))}
      <Form.Group>
        <Button type="submit" disabled={disabled}>
          {submit}
        </Button>
        <Button type="button" onClick={() => addInputPhase()} variant="outline-secondary" className="float-end" disabled={disabled}>
          Add another phase
        </Button>
      </Form.Group>
    </Form>
  )
}

export default TimerPresetForm
