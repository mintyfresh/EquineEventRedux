# frozen_string_literal: true

module Types
  class TimerPhaseType < Types::BaseObject
    implements Types::TimerPhaseableType

    field :extension_in_seconds, Integer, null: false do
      description 'Additional time to add to the phase (or subtract if negative), in seconds'
    end
  end
end
