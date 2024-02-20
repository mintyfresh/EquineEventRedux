# frozen_string_literal: true

module Types
  class TimerPresetCreateInputType < BaseInputObject
    argument :name, String, required: true
    argument :phases, [Types::TimerPresetPhaseInputType], required: false, as: :phases_attributes
  end
end
