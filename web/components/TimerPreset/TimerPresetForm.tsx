import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { Errors } from '../../lib/errors'
import { TimerPhaseDurationUnit, TimerPresetCreateInput, TimerPresetPhaseInput } from '../../lib/generated/graphql'
import AudioClipSelect from '../AudioClip/AudioClipSelect'
import FormControlErrors from '../Form/FormControlErrors'
import FormMultiControlErrors from '../Form/FormMultiControlErrors'

const DURATION_UNIT_KEYS = Object.keys(TimerPhaseDurationUnit)
const DURATION_UNIT_VALUES = Object.values(TimerPhaseDurationUnit)

const calculateInputPhasePositions = function<T extends TimerPresetCreateInput>(input: T): T {
  return { ...input, phases: (input.phases ?? []).map((phase, index) => ({ ...phase, position: index + 1 })) }
}

export interface TimerPresetFormProps {
  input: TimerPresetCreateInput
  errors: Errors
  onUpdate?(input: TimerPresetCreateInput): void
  onSubmit?(input: TimerPresetCreateInput): void
}

const TimerPresetForm: React.FC<TimerPresetFormProps> = ({ input, errors, onUpdate, onSubmit }) => {
  const addInputPhase = () => {
    const newPhases = [
      ...input.phases ?? [],
      {
        name: '',
        durationAmount: 10,
        durationUnit: TimerPhaseDurationUnit.Minutes
      }
    ]

    onUpdate?.({ ...input, phases: newPhases })
  }

  const updateInputPhase = (index: number, phase: Partial<TimerPresetPhaseInput>) => {
    const newPhases = [...input.phases ?? []]
    newPhases[index] = { ...newPhases[index], ...phase }

    onUpdate?.({ ...input, phases: newPhases })
  }

  const deleteInputPhase = (index: number) => {
    const newPhases = [...input.phases ?? []]
    newPhases.splice(index, 1)

    onUpdate?.({ ...input, phases: newPhases })
  }

  return (
    <Form onSubmit={(event) => {
      event.preventDefault()
      onSubmit?.(calculateInputPhasePositions(input))
    }}>
      <Form.Group className="mb-3">
        <Form.Label>Name*</Form.Label>
        <Form.Control
          type="text"
          title="Name"
          value={input.name ?? ''}
          onChange={(event) => onUpdate?.({ ...input, name: event.currentTarget.value })}
          isInvalid={errors.any('name')}
          required
        />
        <FormControlErrors
          name="name"
          errors={errors}
        />
      </Form.Group>
      <h2>Phases</h2>
      {input.phases?.map((phase, index) => (
        <Card key={index} className="mb-3">
          <Card.Header>
            <Row>
              <Col className="my-auto">
                Phase {index + 1}
              </Col>
              <Col xs="auto">
                <Button
                  type="button"
                  onClick={() => deleteInputPhase(index)}
                  variant="link"
                  size="sm"
                  className="text-black"
                  title={`Delete phase ${index + 1}`}
                  disabled={input.phases?.length === 1}
                >
                  <FontAwesomeIcon icon={faTrash} title={`Delete phase ${index + 1}`} />
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
                    onChange={(event) => updateInputPhase(index, { name: event.currentTarget.value })}
                    isInvalid={errors.any(`phases[${index}].name`)}
                    required
                  />
                  <Form.Text>
                    Displayed above the timer when the phase is active.
                  </Form.Text>
                  <FormControlErrors
                    name={`phases[${index}].name`}
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
                      onChange={(event) => updateInputPhase(index, { durationAmount: +event.currentTarget.value })}
                      isInvalid={errors.any(`phases[${index}].durationAmount`)}
                      required
                    />
                    <Form.Select
                      title={`Phase ${index + 1} duration unit`}
                      value={phase.durationUnit ?? TimerPhaseDurationUnit.Minutes}
                      onChange={(event) => updateInputPhase(index, { durationUnit: event.currentTarget.value as TimerPhaseDurationUnit })}
                      isInvalid={errors.any(`phases[${index}].durationUnit`)}
                      required
                    >
                      {DURATION_UNIT_KEYS.map((key, index) => (
                        <option key={key} value={DURATION_UNIT_VALUES[index]}>{key}</option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                  <FormMultiControlErrors
                    names={[
                      `phases[${index}].durationAmount`,
                      `phases[${index}].durationUnit`
                    ]}
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
                    onChange={(audioClipId) => updateInputPhase(index, { audioClipId })}
                    isInvalid={errors.any(`phases[${index}].audioClip`)}
                  />
                  <Form.Text>
                    Played when the phase ends.
                  </Form.Text>
                  <FormControlErrors
                    name={`phases[${index}].audioClip`}
                    errors={errors}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      <Form.Group>
        <Button type="submit">Create Timer Preset</Button>
        <Button type="button" onClick={() => addInputPhase()} variant="outline-secondary" className="float-end">
          Add another phase
        </Button>
      </Form.Group>
    </Form>
  )
}

export default TimerPresetForm
