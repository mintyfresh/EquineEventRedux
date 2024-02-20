# frozen_string_literal: true

module Types
  class TimerPresetUpdateInputType < BaseInputObject
    argument :name, String, required: false
    argument :phases, [Types::TimerPresetPhaseInputType], required: false, as: :phases_attributes
  end
end
