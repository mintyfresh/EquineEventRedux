# frozen_string_literal: true

module Types
  class TimerPhaseDurationUnitType < Types::BaseEnum
    value 'SECONDS', value: 'seconds'
    value 'MINUTES', value: 'minutes'
    value 'HOURS', value: 'hours'
  end
end
