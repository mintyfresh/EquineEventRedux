# frozen_string_literal: true

module Types
  class TimerPresetPhaseInputType < BaseInputObject
    argument :id, ID, required: false
    argument :_destroy, Boolean, required: false

    argument :audio_clip_id, ID, required: false
    argument :name, String, required: false
    argument :position, Integer, required: false
    argument :duration_amount, Integer, required: false
    argument :duration_unit, Types::TimerPhaseDurationUnitType, required: false
  end
end
