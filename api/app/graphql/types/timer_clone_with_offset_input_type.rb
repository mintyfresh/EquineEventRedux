# frozen_string_literal: true

module Types
  class TimerCloneWithOffsetInputType < BaseInputObject
    argument :offset_in_seconds, Integer, required: false
  end
end
